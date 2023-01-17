// @ts-ignore
import omitDeep from "omit-deep";

export const prettyJSON = (message: string, obj: string) => {
  console.log(message, JSON.stringify(obj, null, 2));
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const omit = (object: any, name: string) => {
  return omitDeep(object, name);
};

export const htmlDecode = (input: string): string => {
  // unescape HTML entities
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent!;
};
