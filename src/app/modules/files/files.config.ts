export const moduleConfig = {
    defaults: {},
  
    enums: {
      evenType: ['FILERECEIVED', 'FILEPROCESSED', 'FILEERROR'],
    },
  
    api: {
      route: 'file',
      param: 'file',
      bodyParams: ['file'],
    },
  
  };
  