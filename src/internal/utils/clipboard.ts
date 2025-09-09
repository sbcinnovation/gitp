import { exec } from "child_process";

export const copyToClipboard = (text: string): Promise<void> => {
  const platform = process.platform;
  let command: string;

  if (platform === "darwin") {
    command = `echo "${text.replace(/"/g, '\\"')}" | pbcopy`;
  } else if (platform === "linux") {
    command = `echo "${text.replace(
      /"/g,
      '\\"'
    )}" | xclip -selection clipboard`;
  } else if (platform === "win32") {
    command = `echo "${text.replace(/"/g, '\\"')}" | clip`;
  } else {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};
