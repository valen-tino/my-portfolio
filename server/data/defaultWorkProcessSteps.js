const DEFAULT_WORK_PROCESS_STEPS = [
  {
    title: 'Empathize',
    description: 'I observe and interview users to understand their needs, goals, and problems.',
    order: 1,
    isPublished: true
  },
  {
    title: 'Define',
    description: 'I review the research and clearly state the main problem users need to solve.',
    order: 2,
    isPublished: true
  },
  {
    title: 'Ideate',
    description: 'I explore many possible solutions before I choose ideas to develop.',
    order: 3,
    isPublished: true
  },
  {
    title: 'Prototype',
    description: 'I make simple sketches or models to show how the proposed solutions could work.',
    order: 4,
    isPublished: true
  },
  {
    title: 'Development',
    description:
      'Following Spec-Driven Development with AI-assisted workflows, I build from PRD, ERD, and Design Brief through Local Development, Unit Tests, CI/CD Pipeline, Staging, and In Production—then repeat with Agile Methodology.',
    order: 5,
    isPublished: true
  },
  {
    title: 'Test',
    description:
      'I test the prototypes with users. I use their feedback to find problems and improve the design.',
    order: 6,
    isPublished: true
  }
];

module.exports = DEFAULT_WORK_PROCESS_STEPS;

