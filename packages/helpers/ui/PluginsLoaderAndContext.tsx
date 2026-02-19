import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../constants";
import type { IPluginIPCData } from "@sculptor/main-process/plugins-manager";
import type {
  IPluginEditorToolboxComponentProps,
  IPluginSettingsComponentProps,
} from "@sculptor/shared/types";

interface IPluginComponent {
  App: React.LazyExoticComponent<React.ComponentType>;
  EditorToolbox: React.LazyExoticComponent<
    React.ComponentType<IPluginEditorToolboxComponentProps>
  >;
  Settings: React.LazyExoticComponent<
    React.ComponentType<IPluginSettingsComponentProps<unknown>>
  >;
}

interface IPluginsComponentMap {
  pluginComponentMap: Map<IPluginIPCData, IPluginComponent>;
}

export const PluginsContext = React.createContext<IPluginsComponentMap>({
  pluginComponentMap: new Map(),
});

export const PluginsLoaderAndProvider = (props: React.PropsWithChildren) => {
  const { data: pluginsList } = useQuery({
    queryKey: [QueryKey.PluginsList],
    queryFn: window.electronAPI.fetchPluginsList,
  });

  const pluginComponentMap = React.useMemo(() => {
    const pluginMap = new Map<IPluginIPCData, IPluginComponent>();

    pluginsList?.forEach((plugin) => {
      pluginMap.set(plugin, {
        App: React.lazy(() => lazyPluginLoad(plugin.main.pluginId)),
        EditorToolbox: React.lazy(() =>
          lazyPluginLoad(plugin.main.pluginId, "./EditorToolbox"),
        ),
        Settings: React.lazy(() =>
          lazyPluginLoad(plugin.main.pluginId, "./Settings"),
        ),
      });
    });

    return { pluginComponentMap: pluginMap };
  }, [pluginsList]);

  return (
    <PluginsLoader>
      <PluginsContext.Provider value={pluginComponentMap}>
        {props.children}
      </PluginsContext.Provider>
    </PluginsLoader>
  );
};

export const PluginsLoader = (props: React.PropsWithChildren) => {
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
  plugins: IPluginIPCData[],
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

const lazyPluginLoad = async (
  pluginId: string,
  modulePath = "./App",
): Promise<{ default: any }> => {
  // @ts-expect-error
  await __webpack_init_sharing__("default");

  // @ts-expect-error
  const container = window[pluginId];
  if (!container.__initialized) {
    // @ts-expect-error
    await container.init(__webpack_share_scopes__.default);
    container.__initialized = true;
  }

  try {
    const factory = await container.get(modulePath);
    return factory();
  } catch {
    return { default: () => null };
  }
};
