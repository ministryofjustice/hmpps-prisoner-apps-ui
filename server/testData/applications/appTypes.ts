const appTypes = {
  emergencyCredit: {
    id: 1,
    name: 'Add emergency phone credit',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  addNewOfficialContact: {
    id: 2,
    name: 'Add an official PIN phone contact',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  addNewSocialContact: {
    id: 3,
    name: 'Add a social PIN phone contact',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  removeContact: {
    id: 4,
    name: 'Remove a PIN phone contact',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  swapVOs: {
    id: 5,
    name: 'Swap Visiting Orders (VOs) for PIN Credit',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  supplyContactList: {
    id: 6,
    name: 'Supply list of contacts',
    genericType: false,
    genericForm: false,
    logDetailRequired: false,
  },
  makeGeneralEnquiry: {
    id: 7,
    name: 'Make a general PIN phone enquiry',
    genericType: true,
    genericForm: true,
    logDetailRequired: true,
  },
}

export default appTypes
