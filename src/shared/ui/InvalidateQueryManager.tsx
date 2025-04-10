import React from "react";
import { useQueryClient } from "@tanstack/react-query";

export const InvalidateQueryManager = () => {
  const client = useQueryClient();

  React.useEffect(() => {
    const unsubInvalidate = window.electronAPI.onInvalidateQuery(
      (event, query) => {
        console.log("invalidate query", query);
        client.invalidateQueries({ queryKey: [query] });
      },
    );

    return () => {
      unsubInvalidate();
    };
  }, [client]);

  return null;
};
