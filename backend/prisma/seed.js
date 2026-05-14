import testData from './test-data.json' with { type: 'json' };
import prisma from './client.js';

async function findOrCreateSeason(season) {
  const existing = await prisma.season.findFirst({
    where: { name: season.name }
  });

  if (existing) return existing;

  return prisma.season.create({
    data: {
      name: season.name,
      startDate: new Date(season.startDate),
      endDate: new Date(season.endDate)
    }
  });
}

async function findOrCreateTeam(team, sportId, userId) {
  const existing = await prisma.team.findFirst({
    where: {
      name: team.name,
      year: team.year
    }
  });

  if (existing) return existing;

  return prisma.team.create({
    data: {
      name: team.name,
      town: team.town,
      level: team.level,
      sportId,
      year: team.year,
      userId
    }
  });
}

async function findOrCreateAthlete(athlete, teamId) {
  const existing = await prisma.athlete.findFirst({
    where: {
      firstName: athlete.firstName,
      lastName: athlete.lastName
    }
  });

  const savedAthlete = existing || await prisma.athlete.create({
    data: {
      firstName: athlete.firstName,
      lastName: athlete.lastName
    }
  });

  const existingRosterEntry = await prisma.athleteTeam.findFirst({
    where: {
      athleteId: savedAthlete.id,
      teamId
    }
  });

  if (!existingRosterEntry) {
    await prisma.athleteTeam.create({
      data: {
        athleteId: savedAthlete.id,
        teamId,
        startDate: new Date('2026-08-01')
      }
    });
  }

  return savedAthlete;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: testData.user.email },
    update: {},
    create: testData.user
  });

  const sport = await prisma.sport.upsert({
    where: { name: testData.sport.name },
    update: {},
    create: testData.sport
  });

  for (const season of testData.seasons) {
    await findOrCreateSeason(season);
  }

  const teamsByKey = {};
  for (const team of testData.teams) {
    teamsByKey[team.key] = await findOrCreateTeam(team, sport.id, user.id);
  }

  for (const athlete of testData.athletes) {
    await findOrCreateAthlete(athlete, teamsByKey[athlete.teamKey].id);
  }

  console.log('Seeded test seasons, teams, and athletes.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
