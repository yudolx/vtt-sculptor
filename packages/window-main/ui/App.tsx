import React from "react";
import { Box, BoxProps, styled } from "@mui/joy";
import _ from "lodash";
import { Video } from "./video";
import { SubtitleTable } from "./subtitle-table";
import { Plugins } from "./plugins";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";
import { QueryKey } from "@sculptor/helpers/constants";
import { useQuery } from "@tanstack/react-query";

const debouncedSetSettings = _.debounce(window.electronAPI.setSettings, 300);

export const App = () => {
  const { pluginComponentMap } = React.useContext(PluginsContext);
  const [leftEl, setLeftEl] = React.useState<HTMLDivElement | null>(null);
  const [leftWidth, setLeftWidth] = React.useState<number | null>(null);

  const { data: settings = null } = useQuery({
    queryKey: [QueryKey.Settings],
    queryFn: window.electronAPI.fetchSettings,
  });

  const { current: resizeObserver } = React.useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setLeftWidth(cr.width);
        debouncedSetSettings({
          windowsState: {
            main: {
              leftWidth: cr.width,
            },
          },
        });
      }
    }),
  );

  React.useEffect(() => {
    if (leftEl) {
      resizeObserver.observe(leftEl);
    }

    return () => {
      if (leftEl) {
        resizeObserver.unobserve(leftEl);
      }
    };

    return;
  }, [leftEl]);

  React.useEffect(() => {
    setLeftWidth(settings?.windowsState.main.leftWidth ?? null);
  }, [settings]);

  return (
    <AppWrapper leftWidth={leftWidth ?? null}>
      <Left ref={(el) => setLeftEl(el)}>
        <VideoWrapper>
          <Video />
        </VideoWrapper>
        <SubtitleTableWrapper
          onKeyDown={(e) => {
            if (["ArrowUp", "ArrowDown", "Space"].includes(e.code)) {
              e.preventDefault();
            }
          }}
        >
          <SubtitleTable />
        </SubtitleTableWrapper>
      </Left>
      {pluginComponentMap.size > 0 ? (
        <Right>
          <Plugins />
        </Right>
      ) : null}
    </AppWrapper>
  );
};

const AppWrapper = styled(Box, {
  name: "AppWrapper",
  shouldForwardProp: (prop) => prop !== "leftWidth",
})<BoxProps & { leftWidth: number | null }>((props) => {
  return {
    display: "grid",
    gridTemplateColumns: `${props.leftWidth === null ? "auto" : `${props.leftWidth}px`} auto`,
    height: "100vh",
  };
});

const VideoWrapper = styled(Box, { name: "VideoWrapper" })(() => {
  return {
    display: "flex",
    maxHeight: 500,
  };
});

const SubtitleTableWrapper = styled(Box, { name: "SubtitleTableWrapper" })(
  () => {
    return {
      flexGrow: 1,
      overflow: "auto",
    };
  },
);

const Left = styled("div", { name: "Left" })(() => {
  return {
    resize: "horizontal",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  };
});

const Right = styled("div", { name: "Right" })(() => {
  return {
    borderLeft: "1px #e5e5e5 solid",
    overflow: "auto",
  };
});
