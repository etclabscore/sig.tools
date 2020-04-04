import { MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { JSONSchema } from "@apidevtools/json-schema-ref-parser";

const openrpcDocumentToJSONRPCSchema = (openrpcDocument: any, methodName: string): undefined | JSONSchema => {
  const method = openrpcDocument.methods.find((m: MethodObject) => {
    return m.name === methodName;
  });
  if (!method) {
    return;
  }
  return {
    type: "object",
    properties: method.params && (method.params as ContentDescriptorObject[])
      .reduce((memo: any, param: ContentDescriptorObject) => {
        memo[param.name] = {
          ...param.schema,
          markdownDescription: param.description || param.summary,
          description: param.description || param.summary,
          additionalProperties: false,
        };
        return memo;
      }, {}),
  };
};

export default openrpcDocumentToJSONRPCSchema;
