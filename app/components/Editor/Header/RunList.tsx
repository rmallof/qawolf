import { Box } from "grommet";

import { useTestHistory } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";
import Menu from "../../shared/Menu";
import Text from "../../shared/Text";
import RunListItem from "./RunListItem";

type Props = {
  onClose: () => void;
  testId: string | null;
};

const width = "180px";

export default function RunList({ onClose, testId }: Props): JSX.Element {
  const { data } = useTestHistory({ id: testId });

  let innerHtml: JSX.Element | JSX.Element[];

  if (!data?.testHistory?.length) {
    const message = data?.testHistory ? copy.noHistory : copy.loading;

    innerHtml = (
      <Box
        height={edgeSize.large}
        justify="center"
        pad={{ horizontal: "xsmall" }}
      >
        <Text color="gray9" size="component">
          {message}
        </Text>
      </Box>
    );
  } else {
    innerHtml = data.testHistory.map((run) => {
      return <RunListItem key={run.id} run={run} />;
    });
  }

  return (
    <Menu direction="down" onClick={onClose} width={width}>
      {innerHtml}
    </Menu>
  );
}
