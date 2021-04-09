import { Box } from "grommet";
import { SiNetlify, SiZeit } from "react-icons/si";

import { DeploymentProvider } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Button from "../../../shared/AppButton";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

type Props = {
  provider: DeploymentProvider | null;
  setProvider: (provider: DeploymentProvider) => void;
};

const buttonProps = {
  justify: "center" as const,
  type: "secondary" as const,
  width: `calc(50% - ${edgeSize.xxxsmall})`,
};

export default function DeployProvider({
  provider,
  setProvider,
}: Props): JSX.Element {
  return (
    <>
      <Text {...labelTextProps}>{copy.deployService}</Text>
      <Box direction="row" justify="between">
        <Button
          {...buttonProps}
          IconComponent={SiZeit}
          isSelected={provider === "vercel"}
          label={copy.vercel}
          onClick={() => setProvider("vercel")}
        />
        <Button
          {...buttonProps}
          IconComponent={SiNetlify}
          isSelected={provider === "netlify"}
          label={copy.netlify}
          onClick={() => setProvider("netlify")}
        />
      </Box>
    </>
  );
}
