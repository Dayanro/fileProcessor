export const moduleConfig = {
  defaults: {
    pathEnv: {
      workspacePath: 'workspace_path',
    },
    modificationsType: {
      upperCase: 'Characters converted to be upper-case',
    },
  },

  enums: {
    evenType: {
      fileRecived: 'FILERECEIVED',
      fileProcessed: 'FILEPROCESSED',
      fileError: 'FILEERROR',
    },
    fileNames: {
      workBucket: 'work-bucket',
      processedData: 'processed-data',
      metadata: 'metadata',
    },
  },

  api: {
    route: 'file',
    param: 'file',
    bodyParams: ['file'],
  },
};
