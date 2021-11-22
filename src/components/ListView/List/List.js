import { parseOSPath, pad } from "../../../utilities/Utilities"

export const list = (logdata, formdata) => {
  let inputPath = [formdata.inpatha, formdata.inpathb];
  let list = "";

  logdata.forEach((sd, index) => {
    for (let i = 0; i < sd.fileAmount; i++) {
      list = list + "file '" +
      parseOSPath(logdata[0] ? inputPath[index] : inputPath[index-1]) +
      pad(i+1, 8) + ".WAV'\n"
    }
  });
  return list;
}
