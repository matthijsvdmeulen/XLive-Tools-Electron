import { parseOSPath, pad } from "../../../utilities/Utilities"

export const list = session => {
  let list = "";
  for (let i = 0; i < session.fileAmount; i++) {
    list = list + "file '" +
    parseOSPath(session.folder) +
    pad((i+1).toString(16).toUpperCase(), 8) + ".WAV'\n"
  }
  return list;
}
