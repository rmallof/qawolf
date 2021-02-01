import { Box, ResponsiveContext } from "grommet";
import React, { FC, useContext } from "react";

import Application from "./Application";
import { RunnerProvider } from "./contexts/RunnerContext";
import { TestProvider } from "./contexts/TestContext";
import Header from "./Header";
import { useMode } from "./hooks/mode";
import Mobile from "./Mobile";
import Modals from "./Modals";
import Sidebar from "./Sidebar";

const WithProviders: FC = ({ children }) => {
  return (
    <TestProvider>
      <RunnerProvider>{children}</RunnerProvider>
    </TestProvider>
  );
};

export default function Editor(): JSX.Element {
  const mode = useMode();
  const size = useContext(ResponsiveContext);
  const isLarge = size === "large";

  // use overflow hidden because Grommet adds small amount of space
  return (
    <WithProviders>
      <Box background="lightBlue" height="100vh">
        <Box
          direction="row"
          fill
          justify="between"
          overflow={isLarge ? "hidden" : "auto"}
        >
          {isLarge && <Sidebar />}
          <Box fill margin={isLarge ? { horizontal: "large" } : undefined}>
            <Header mode={mode} />
            {isLarge ? <Application mode={mode} /> : <Mobile mode={mode} />}
          </Box>
        </Box>
        <Modals mode={mode} />
      </Box>
    </WithProviders>
  );
}
