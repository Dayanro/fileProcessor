export const moduleConfig = {
  defaults: {},

  enums: {
    evenType: {
      fileRecived: "FILERECEIVED",
      fileProcessed: "FILEPROCESSED",
      fileError: "FILEERROR",
    },
  },

  api: {
    route: "file",
    param: "file",
    bodyParams: ["file"],
  },
};
