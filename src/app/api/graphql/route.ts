import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeInteraction } from '@/lib/llm';

function parseBudget(pricingText: string | null): number {
  if (!pricingText) return 0;
  
  const clean = pricingText.toLowerCase();
  
  // Look for "$Xk" or "X k" (multiplier 1000)
  const kMatch = clean.match(/\$(\d+(?:\.\d+)?)\s*k/);
  if (kMatch && kMatch[1]) {
    return parseFloat(kMatch[1]) * 1000;
  }
  
  // Look for "$X,000" or "$X"
  const digitMatch = clean.match(/\$(\d{1,3}(?:,\d{3})+|\d+)/);
  if (digitMatch && digitMatch[1]) {
    return parseFloat(digitMatch[1].replace(/,/g, ''));
  }
  
  // Look for generic number sequence of size 4-8
  const numbers = clean.replace(/,/g, '').match(/\b\d{4,8}\b/g);
  if (numbers && numbers[0]) {
    return parseFloat(numbers[0]);
  }
  
  return 0;
}

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
    opportunity: Opportunity
    meetings: [Meeting!]!
    notes: [Note!]!
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    role: String
    accountId: ID!
    createdAt: String!
    updatedAt: String!
    account: Account
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
    account: Account
  }

  type Opportunity {
    id: ID!
    title: String!
    value: Float!
    stage: String!
    closeDate: String
    accountId: ID!
    createdAt: String!
    updatedAt: String!
    account: Account
  }

  type Meeting {
    id: ID!
    title: String!
    date: String!
    summary: String
    transcript: String
    accountId: ID!
    createdAt: String!
    updatedAt: String!
    account: Account
  }

  type Note {
    id: ID!
    title: String!
    content: String!
    accountId: ID!
    createdAt: String!
    updatedAt: String!
    account: Account
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
    opportunities: [Opportunity!]!
    allContacts: [Contact!]!
    allTasks: [Task!]!
    meetings: [Meeting!]!
    notes: [Note!]!
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

    updateOpportunityStage(id: ID!, stage: String!): Opportunity!

    createContact(name: String!, email: String!, role: String, accountId: ID!): Contact!

    createTask(title: String!, accountId: ID!, dueDate: String): Task!

    createMeeting(title: String!, summary: String, transcript: String, accountId: ID!): Meeting!

    createNote(title: String!, content: String!, accountId: ID!): Note!

    simulateHubSpotMigration(csvContent: String!): [Account!]!
    
    resetDatabase: Boolean!
  }
`;

const resolvers = {
  Account: {
    opportunity: async (parent: any) => {
      return prisma.opportunity.findUnique({
        where: { accountId: parent.id },
      });
    },
    meetings: async (parent: any) => {
      return prisma.meeting.findMany({
        where: { accountId: parent.id },
        orderBy: { date: 'desc' },
      });
    },
    notes: async (parent: any) => {
      return prisma.note.findMany({
        where: { accountId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Contact: {
    account: async (parent: any) => {
      return prisma.account.findUnique({ where: { id: parent.accountId } });
    },
  },

  Task: {
    account: async (parent: any) => {
      return prisma.account.findUnique({ where: { id: parent.accountId } });
    },
  },

  Meeting: {
    account: async (parent: any) => {
      return prisma.account.findUnique({ where: { id: parent.accountId } });
    },
  },

  Note: {
    account: async (parent: any) => {
      return prisma.account.findUnique({ where: { id: parent.accountId } });
    },
  },

  Query: {
    accounts: async () => {
      return prisma.account.findMany({
        include: {
          contacts: true,
          interactions: { orderBy: { timestamp: 'desc' } },
          memories: { orderBy: { version: 'desc' } },
          tasks: { orderBy: { createdAt: 'desc' } },
          opportunity: true,
          meetings: true,
          notes: true,
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
          opportunity: true,
          meetings: true,
          notes: true,
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

    opportunities: async () => {
      return prisma.opportunity.findMany({
        include: { account: true },
        orderBy: { updatedAt: 'desc' },
      });
    },

    allContacts: async () => {
      return prisma.contact.findMany({
        include: { account: true },
        orderBy: { name: 'asc' },
      });
    },

    allTasks: async () => {
      return prisma.task.findMany({
        include: { account: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    meetings: async () => {
      return prisma.meeting.findMany({
        include: { account: true },
        orderBy: { date: 'desc' },
      });
    },

    notes: async () => {
      return prisma.note.findMany({
        include: { account: true },
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
      const aiResult = await analyzeInteraction(content, explicitAccountName);
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

      // Create/Update Opportunity and parse budget
      const budgetValue = parseBudget(aiResult.pricing);
      await prisma.opportunity.upsert({
        where: { accountId: account.id },
        update: { 
          stage: aiResult.stage,
          value: budgetValue > 0 ? budgetValue : undefined
        },
        create: {
          title: `${finalAccountName} Enterprise Deal`,
          stage: aiResult.stage,
          value: budgetValue,
          accountId: account.id,
        }
      });

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
          const existingTask = await prisma.task.findFirst({
            where: {
              accountId: account.id,
              title: t.title,
              completed: false
            }
          });
          if (!existingTask) {
            await prisma.task.create({
              data: {
                accountId: account.id,
                title: t.title,
                dueDate: t.dueDate ? new Date(t.dueDate) : null,
              },
            });
          }
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
          opportunity: true,
        },
      });
    },

    updateOpportunityStage: async (_: any, { id, stage }: { id: string; stage: string }) => {
      const opportunity = await prisma.opportunity.update({
        where: { id },
        data: { stage },
      });
      // Sync back to Account stage
      await prisma.account.update({
        where: { id: opportunity.accountId },
        data: { stage },
      });
      return opportunity;
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

        // Upsert opportunity
        const budgetValue = parseBudget(note);
        await prisma.opportunity.upsert({
          where: { accountId: account.id },
          update: { stage },
          create: {
            title: `${companyName} Opportunity`,
            stage: stage,
            value: budgetValue,
            accountId: account.id,
          }
        });

        const fullAcc = await prisma.account.findUnique({
          where: { id: account.id },
          include: {
            contacts: true,
            interactions: true,
            memories: true,
            tasks: true,
            opportunity: true,
          },
        });
        accountsCreated.push(fullAcc);
      }

      return accountsCreated;
    },

    createContact: async (_: any, { name, email, role, accountId }: { name: string; email: string; role?: string; accountId: string }) => {
      return prisma.contact.create({
        data: { name, email, role: role || null, accountId },
      });
    },

    createTask: async (_: any, { title, accountId, dueDate }: { title: string; accountId: string; dueDate?: string }) => {
      return prisma.task.create({
        data: { title, accountId, dueDate: dueDate ? new Date(dueDate) : null },
      });
    },

    createMeeting: async (_: any, { title, summary, transcript, accountId }: { title: string; summary?: string; transcript?: string; accountId: string }) => {
      const meeting = await prisma.meeting.create({
        data: { title, summary: summary || null, transcript: transcript || null, accountId },
      });

      if (transcript) {
        const account = await prisma.account.findUnique({ where: { id: accountId } });
        const aiResult = await analyzeInteraction(transcript, account?.name);
        const latestMemory = await prisma.accountMemory.findFirst({
          where: { accountId },
          orderBy: { version: 'desc' },
        });
        const nextVersion = latestMemory ? latestMemory.version + 1 : 1;
        
        await prisma.accountMemory.create({
          data: {
            accountId,
            version: nextVersion,
            summary: aiResult.summary,
            pricing: aiResult.pricing,
            competitors: aiResult.competitors,
            featureRequests: aiResult.featureRequests,
          },
        });

        await prisma.account.update({
          where: { id: accountId },
          data: { stage: aiResult.stage },
        });

        const budgetValue = parseBudget(aiResult.pricing);
        await prisma.opportunity.upsert({
          where: { accountId },
          update: { stage: aiResult.stage, value: budgetValue > 0 ? budgetValue : undefined },
          create: { title: `${title} Opportunity`, stage: aiResult.stage, value: budgetValue, accountId },
        });

        if (aiResult.tasks && aiResult.tasks.length > 0) {
          for (const t of aiResult.tasks) {
            const existingTask = await prisma.task.findFirst({
              where: { accountId, title: t.title, completed: false }
            });
            if (!existingTask) {
              await prisma.task.create({
                data: { accountId, title: t.title, dueDate: t.dueDate ? new Date(t.dueDate) : null },
              });
            }
          }
        }
      }

      return meeting;
    },

    createNote: async (_: any, { title, content, accountId }: { title: string; content: string; accountId: string }) => {
      return prisma.note.create({
        data: { title, content, accountId },
      });
    },

    resetDatabase: async () => {
      try {
        await prisma.opportunity.deleteMany({});
        await prisma.task.deleteMany({});
        await prisma.meeting.deleteMany({});
        await prisma.note.deleteMany({});
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
