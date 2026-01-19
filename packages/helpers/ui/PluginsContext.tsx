import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../constants";
import type { IPlugin } from "@sculptor/main-process/plugins-manager";

export const PluginsContext = (props: React.PropsWithChildren) => {
  const { data: pluginsList } = useQuery({
    queryKey: [QueryKey.PluginsList],
    queryFn: window.electronAPI.fetchPluginsList,
  });
  const [allLoaded, setAllLoaded] = React.useState(false);

  React.useEffect(() => {
    const scriptTags: HTMLScriptElement[] = [];

    if (pluginsList) {
      pluginsList.forEach((plugin) => {
        const p = document.createElement("script");
        p.src = `plugins://${plugin.main.pluginId}/file/exposes.js`;
        p.async = true;

        scriptTags.push(p);
        document.head.appendChild(p);
      });

      allScriptsLoaded(pluginsList, scriptTags).finally(() => {
        setAllLoaded(true);
      });
    }

    return () => {
      scriptTags.forEach((script) => {
        document.head.removeChild(script);
      });
      scriptTags.length = 0;
    };
  }, [pluginsList]);

  if (!allLoaded) {
    return null;
  } else {
    console.log("all loaded");
    return props.children;
  }
};

const allScriptsLoaded = (
  plugins: IPlugin[],
  scriptEls: HTMLScriptElement[],
) => {
  const promises: Promise<void>[] = [];

  for (let i = 0; i < scriptEls.length; i++) {
    const plugin = plugins.at(i)!;
    const el = scriptEls.at(i)!;
    promises.push(
      new Promise((resolve, reject) => {
        el.onload = () => {
          const interval = setInterval(() => {
            // @ts-expect-error
            if (window[plugin.main.pluginId].get) {
              window.clearInterval(interval);
              resolve();
            }
          }, 50);
        };
        el.onerror = () => reject();
      }),
    );
  }

  return Promise.allSettled(promises);
};
