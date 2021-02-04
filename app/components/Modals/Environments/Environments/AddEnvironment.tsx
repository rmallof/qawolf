import { Box, Button } from "grommet";
import styled from "styled-components";

import { copy } from "../../../../theme/copy";
import {
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme-new";
import Add from "../../../shared-new/icons/Add";
import Text from "../../../shared-new/Text";

type Props = { onClick: () => void };

const StyledButton = styled(Button)`
  p,
  svg {
    transition: all ${transitionDuration};
  }

  &:hover {
    p {
      color: ${colors.gray9};
    }

    svg {
      fill: ${colors.gray9};
    }
  }
`;

const color = colors.gray6;

export default function AddEnvironment({ onClick }: Props): JSX.Element {
  return (
    <StyledButton onClick={onClick} plain>
      <Box align="center" direction="row" pad="xxsmall">
        <Add color={color} size={edgeSize.small} />
        <Text color={color} margin={{ left: "xxsmall" }} size="component">
          {copy.environmentNew}
        </Text>
      </Box>
    </StyledButton>
  );
}
