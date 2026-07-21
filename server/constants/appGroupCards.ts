export interface AppGroupCard {
  image: string
  description: string
}

export const DEFAULT_APP_GROUP_CARD: AppGroupCard = {
  image: '/assets/images/app-groups/placeholder.svg',
  description: 'Send an app from this group.',
}

export const APP_GROUP_CARDS: Record<string, AppGroupCard> = {
  'PIN phones': {
    image: '/assets/images/app-groups/pin-phones.png',
    description: 'Add or remove a contact from your list, add emergency credit, add phone contacts and swap VOs',
  },
  Faith: {
    image: '/assets/images/app-groups/faith.png',
    description: 'Ask about worship, chaplaincy and seeing a faith leader',
  },
  Money: {
    image: '/assets/images/app-groups/money.png',
    description: 'Refunds, balances, court fines, disbursements, transfers and charitable gifts',
  },
  Gym: {
    image: '/assets/images/app-groups/gym.png',
    description: 'Join the gym or book a session or course',
  },
  Healthcare: {
    image: '/assets/images/app-groups/healthcare.png',
    description: 'Need description',
  },
  'Incentives (IEP)': {
    image: '/assets/images/app-groups/incentives-iep.png',
    description: 'Ask about appeals and apply to increase your incentive status.',
  },
  'Jobs, courses, education and activities': {
    image: '/assets/images/app-groups/jobs-courses-activities.png',
    description: 'Prison jobs, education, wages, being a Listener or mentor and Duke of Edinburgh award.',
  },
  Kitchens: {
    image: '/assets/images/app-groups/kitchens.png',
    description: 'Need description',
  },
  Programmes: {
    image: '/assets/images/app-groups/programmes.png',
    description: 'Courses to help with behaviour, violence reduction and anger management.',
  },
  Psychology: {
    image: '/assets/images/app-groups/psychology.png',
    description: 'Need description',
  },
  Interventions: {
    image: '/assets/images/app-groups/interventions.png',
    description: 'Therapy, support meetings and help with substance misuse and gambling.',
  },
  Library: {
    image: '/assets/images/app-groups/library.png',
    description: 'Join, find books, ask about Storybook Mums/Dads and reading skills with Shannon Trust.',
  },
  'Offender Management Unit (OMU)': {
    image: '/assets/images/app-groups/omu.png',
    description:
      'Contact staff, questions about court, Foreign Nationals, parole, home detention curfew, release dates and transfers.',
  },
  Property: {
    image: '/assets/images/app-groups/property.png',
    description: 'Get a copy of your property card, facilities lists and send or store things.',
  },
  Resettlement: {
    image: '/assets/images/app-groups/resettlement.png',
    description: 'Help with benefits, grants, jobs and housing before getting out.',
  },
  Residential: {
    image: '/assets/images/app-groups/residential.png',
    description: 'Ask about your cell and wing, new kit, mattress and cell moves.',
  },
  Safety: {
    image: '/assets/images/app-groups/safety.png',
    description: 'Help with debt, bullying and distraction packs.',
  },
  Security: {
    image: '/assets/images/app-groups/security.png',
    description: 'Contact security staff and help with any incidents.',
  },
  Orders: {
    image: '/assets/images/app-groups/orders.png',
    description: 'Catalogue orders and returns, emergency vapes and newspapers.',
  },
  'Visits, contact and family': {
    image: '/assets/images/app-groups/visits-contact.png',
    description: 'Support with visitor lists, video calls, letters, emails, AVs and VOs.',
  },
  'Legal and immigration': {
    image: '/assets/images/app-groups/legal-immigration.png',
    description: 'Help with legal clinics, police contact and immigration enforcement questions.',
  },
  'Diversity and inclusion': {
    image: '/assets/images/app-groups/diversity-inclusion.png',
    description: 'Mentoring, disability, LGBTQ+, veteran and race support and report an incident.',
  },
  'Laptop help': {
    image: '/assets/images/app-groups/laptops.png',
    description: 'Support with laptops, breakages, returns, passwords and Content Hub.',
  },
}

export const getAppGroupCard = (groupName: string): AppGroupCard => APP_GROUP_CARDS[groupName] ?? DEFAULT_APP_GROUP_CARD
