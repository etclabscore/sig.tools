
const changePermissionContext = (ev: MessageEvent, response: any, str: string) => {
  if (
    (ev.data.method === "requestPermissions" || ev.data.method === "getPermissions")
    && Array.isArray(response.result)
  ) {
    response.result = response.result.map((r: any) => {
      return {
        ...r,
        "@context": [
          str,
        ],
      };
    });
  }
  return response;
};

export default changePermissionContext;
