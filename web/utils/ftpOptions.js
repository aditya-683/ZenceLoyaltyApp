import { FtpSettings } from "../model/ftpSettings.modal.js"


export const getFTPOptions = async (store, path) => {
  const appSettings = await FtpSettings.findOne({
    StoreName: store,
    isDeleted: false
  });

  return {
    host: appSettings.store,
    username: appSettings.username,
    port: appSettings.port,
    password: appSettings.password,
    path: 'path',
    remoteDir: appSettings.remoteDir,
  };

  /*Example
  return {
    host: 'batainternationalftp.ercx.co',
    username: 'BataSingapore',
    port: '2222',
    password: 'Mqaj4h2zWpNY',
    path: path,
    remoteDir: '//ECOM',
  }
  */
};
