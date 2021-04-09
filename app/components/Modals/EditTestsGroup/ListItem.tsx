import { Box } from "grommet";

import { Group } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border, colors, edgeSize, overflowStyle } from "../../../theme/theme";
import Folder from "../../shared/icons/Folder";
import FolderEmpty from "../../shared/icons/FolderEmpty";
import RadioButton from "../../shared/RadioButton";
import Text from "../../shared/Text";

type Props = {
  group: Group | null;
  isChecked: boolean;
  onClick: (groupId: string) => void;
};

export default function ListItem({
  group,
  isChecked,
  onClick,
}: Props): JSX.Element {
  const IconComponent = group ? Folder : FolderEmpty;
  const groupName = group?.name || copy.noGroup;

  const handleClick = (): void => onClick(group?.id || "");

  const labelHtml = (
    <Box align="center" direction="row" margin={{ left: "xxsmall" }}>
      <IconComponent color={colors.gray9} size={edgeSize.small} />
      <Text
        color="gray9"
        margin={{ left: "xxsmall" }}
        size="component"
        style={overflowStyle}
      >
        {groupName}
      </Text>
    </Box>
  );

  return (
    <Box
      align="center"
      direction="row"
      border={{ ...border, side: "top" }}
      pad={{ vertical: "small" }}
    >
      <RadioButton
        a11yTitle={`select ${groupName}`}
        checked={isChecked}
        label={labelHtml}
        name="group"
        onChange={handleClick}
      />
    </Box>
  );
}
