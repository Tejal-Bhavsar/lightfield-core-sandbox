import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeInteraction } from '@/lib/llm';

const typeDefs = `#graphql
  type Account {
    id: ID!
    name: String!
    website: String
    logoUrl: String
    stage: String!
    createdAt: String!
    updatedAt: String!
    contacts: [Contact!]!
    interactions: [Interaction!]!
    memories: [AccountMemory!]!
    tasks: [Task!]!
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    role: String
    accountId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Interaction {
    id: ID!
    type: String!
    channel: String
    content: String!
    sender: String
    timestamp: String!
    accountId: ID!
    createdAt: String!
  }

  type AccountMemory {
    id: ID!
    version: Int!
    summary: String!
    pricing: String
    competitors: String
    featureRequests: String
    accountId: ID!
    createdAt: String!
  }

  type Task {
    id: ID!
    title: String!
    completed: Boolean!
    dueDate: String
    accountId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Citation {
    id: ID!
    type: String!
    channel: String
    content: String!
    sender: String
    timestamp: String!
    accountName: String!
  }

  type SearchResult {
    answer: String!
    citations: [Citation!]!
  }

  type Query {
    accounts: [Account!]!
    account(id: ID!): Account
    interactions(accountId: ID!): [Interaction!]!
    tasks(accountId: ID!): [Task!]!
    searchMemories(query: String!): SearchResult!
  }

  type Mutation {
    ingestRawActivity(
      type: String!
      channel: String
      content: String!
      sender: String
      senderEmail: String
      accountName: String
    ): Account!

    toggleTask(id: ID!, completed: Boolean!): Task!

    simulateHubSpotMigration(csvContent: String!): [Account!]!
    
    resetDatabase: Boolean!
  }
`;

const resolvers = {
  Query: {
    accounts: async () => {
      return prisma.account.findMany({
        include: {
          contacts: true,
          interactions: { orderBy: { timestamp: 'desc' } },
          memories: { orderBy: { version: 'desc' } },
          tasks: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    },

    account: async (_: any, { id }: { id: string }) => {
      return prisma.account.findUnique({
        where: { id },
        include: {
          contacts: true,
          interactions: { orderBy: { timestamp: 'desc' } },
          memories: { orderBy: { version: 'desc' } },
          tasks: { orderBy: { createdAt: 'desc' } },
        },
      });
    },

    interactions: async (_: any, { accountId }: { accountId: string }) => {
      return prisma.interaction.findMany({
        where: { accountId },
        orderBy: { timestamp: 'desc' },
      });
    },

    tasks: async (_: any, { accountId }: { accountId: string }) => {
      return prisma.task.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
      });
    },

    searchMemories: async (_: any, { query }: { query: string }) => {
      const queryLower = query.toLowerCase();

      // Find interactions that contain query keywords
      const interactions = await prisma.interaction.findMany({
        include: { account: true },
      });

      const matchedInteractions = interactions.filter((i) =>
        i.content.toLowerCase().includes(queryLower) ||
        i.account.name.toLowerCase().includes(queryLower)
      );

      if (matchedInteractions.length === 0) {
        return {
          answer: "I couldn't find any customer interactions matching your search query. Please try searching for a different keyword like 'pricing', 'SSO', or an account name.",
          citations: [],
        };
      }

      // Generate synthesized answer
      const accountsList = Array.from(new Set(matchedInteractions.map((i) => i.account.name)));
      let answer = `I found references to ${query} across ${matchedInteractions.length} interaction(s) involving **${accountsList.join(', ')}**.\n\n`;

      if (queryLower.includes('pricing') || queryLower.includes('budget') || queryLower.includes('$')) {
        answer += `Regarding pricing, clients are asking about tier structures and custom terms. `;
        matchedInteractions.forEach((i, idx) => {
          answer += `On ${new Date(i.timestamp).toLocaleDateString()}, in a ${i.type.toLowerCase()} [${idx + 1}], ${i.sender || 'someone'} mentioned: "${i.content.slice(0, 120).trim()}..." `;
        });
      } else if (queryLower.includes('sso') || queryLower.includes('saml') || queryLower.includes('security')) {
        answer += `Feature requests for SSO/Security are active. `;
        matchedInteractions.forEach((i, idx) => {
          answer += `Specifically, **${i.account.name}** requested SSO details during a ${i.type.toLowerCase()} [${idx + 1}], stating: "${i.content.slice(0, 100).trim()}..." `;
        });
      } else {
        answer += `Here are the matching discussions: `;
        matchedInteractions.forEach((i, idx) => {
          answer += `**${i.account.name}** discussed this in a ${i.type.toLowerCase()} [${idx + 1}]: "${i.content.slice(0, 120).trim()}..." `;
        });
      }

      const citations = matchedInteractions.map((i) => ({
        id: i.id,
        type: i.type,
        channel: i.channel,
        content: i.content,
        sender: i.sender,
        timestamp: i.timestamp.toISOString(),
        accountName: i.account.name,
      }));

      return {
        answer,
        citations,
      };
    },
  },

  Mutation: {
    ingestRawActivity: async (
      _: any,
      {
        type,
        channel,
        content,
        sender,
        senderEmail,
        accountName: explicitAccountName,
      }: {
        type: string;
        channel?: string;
        content: string;
        sender?: string;
        senderEmail?: string;
        accountName?: string;
      }
    ) => {
      // 1. Analyze content using LLM / Local NLP Pipeline
      const aiResult = await analyzeInteraction(content);
      const finalAccountName = explicitAccountName || aiResult.accountName;

      // 2. Find or Create Account
      let account = await prisma.account.findFirst({
        where: { name: { equals: finalAccountName } },
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            name: finalAccountName,
            stage: aiResult.stage,
            website: `${finalAccountName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            logoUrl: `https://logo.clearbit.com/${finalAccountName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          },
        });
      } else {
        // Update account stage if we got a fresh signal
        account = await prisma.account.update({
          where: { id: account.id },
          data: { stage: aiResult.stage },
        });
      }

      // 3. Create Contact if sender info exists
      if (sender && senderEmail) {
        await prisma.contact.upsert({
          where: { email: senderEmail },
          update: { name: sender, role: 'Key Contact' },
          create: {
            email: senderEmail,
            name: sender,
            role: 'Key Contact',
            accountId: account.id,
          },
        });
      }

      // 4. Create Interaction
      await prisma.interaction.create({
        data: {
          type,
          channel: channel || null,
          content,
          sender: sender || 'External Client',
          accountId: account.id,
          timestamp: new Date(),
        },
      });

      // 5. Version the Memory
      const latestMemory = await prisma.accountMemory.findFirst({
        where: { accountId: account.id },
        orderBy: { version: 'desc' },
      });

      const nextVersion = latestMemory ? latestMemory.version + 1 : 1;

      await prisma.accountMemory.create({
        data: {
          accountId: account.id,
          version: nextVersion,
          summary: aiResult.summary,
          pricing: aiResult.pricing,
          competitors: aiResult.competitors,
          featureRequests: aiResult.featureRequests,
        },
      });

      // 6. Create Tasks
      if (aiResult.tasks && aiResult.tasks.length > 0) {
        for (const t of aiResult.tasks) {
          await prisma.task.create({
            data: {
              accountId: account.id,
              title: t.title,
              dueDate: t.dueDate ? new Date(t.dueDate) : null,
            },
          });
        }
      }

      // Return refreshed Account
      return prisma.account.findUnique({
        where: { id: account.id },
        include: {
          contacts: true,
          interactions: { orderBy: { timestamp: 'desc' } },
          memories: { orderBy: { version: 'desc' } },
          tasks: { orderBy: { createdAt: 'desc' } },
        },
      });
    },

    toggleTask: async (_: any, { id, completed }: { id: string; completed: boolean }) => {
      return prisma.task.update({
        where: { id },
        data: { completed },
      });
    },

    simulateHubSpotMigration: async (_: any, { csvContent }: { csvContent: string }) => {
      // Minimal CSV parser to simulate structured HubSpot import
      const rows = csvContent.split('\n').map((row) => row.split(','));
      const headers = rows[0]?.map((h) => h.trim().toLowerCase());
      
      const accountsCreated: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;

        // Extract columns based on header
        const companyNameIdx = headers.indexOf('company');
        const stageIdx = headers.indexOf('stage');
        const emailIdx = headers.indexOf('email');
        const contactNameIdx = headers.indexOf('contact');
        const noteIdx = headers.indexOf('notes');

        const companyName = row[companyNameIdx] || 'Acme';
        const stage = row[stageIdx] || 'Lead';
        const email = row[emailIdx] || '';
        const contactName = row[contactNameIdx] || '';
        const note = row[noteIdx] || 'Imported from HubSpot migration.';

        // Find or create account
        let account = await prisma.account.findFirst({
          where: { name: { equals: companyName } },
        });

        if (!account) {
          account = await prisma.account.create({
            data: {
              name: companyName,
              stage: stage,
              website: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            },
          });
        }

        // Add contact
        if (email && contactName) {
          await prisma.contact.upsert({
            where: { email },
            update: { name: contactName },
            create: {
              name: contactName,
              email,
              accountId: account.id,
            },
          });
        }

        // Add note as an interaction
        await prisma.interaction.create({
          data: {
            type: 'EMAIL',
            channel: 'HubSpot Migration Import',
            content: note,
            sender: contactName || 'System Import',
            accountId: account.id,
          },
        });

        // Add standard memory
        await prisma.accountMemory.create({
          data: {
            accountId: account.id,
            version: 1,
            summary: `Migrated from HubSpot. Initial notes: "${note}"`,
            pricing: note.toLowerCase().includes('budget') ? 'Disclosed budget details in HubSpot import.' : null,
            featureRequests: note.toLowerCase().includes('sso') ? 'SSO' : null,
          },
        });

        const fullAcc = await prisma.account.findUnique({
          where: { id: account.id },
          include: {
            contacts: true,
            interactions: true,
            memories: true,
            tasks: true,
          },
        });
        accountsCreated.push(fullAcc);
      }

      return accountsCreated;
    },

    resetDatabase: async () => {
      try {
        await prisma.task.deleteMany({});
        await prisma.accountMemory.deleteMany({});
        await prisma.interaction.deleteMany({});
        await prisma.contact.deleteMany({});
        await prisma.account.deleteMany({});
        return true;
      } catch (e) {
        console.error("Failed to reset database", e);
        return false;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => ({ req }),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
