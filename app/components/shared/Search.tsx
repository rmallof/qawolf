import { Box, BoxProps } from "grommet";
import { ChangeEvent, useRef } from "react";

import { useOnHotKey } from "../../hooks/onHotKey";
import { copy } from "../../theme/copy";
import { borderSize, colors, edgeSize } from "../../theme/theme";
import TextInput from "./AppTextInput";
import SearchIcon from "./icons/Search";
import Text from "./Text";

type Props = {
  id?: string;
  search: string;
  setSearch: (search: string) => void;
  width?: BoxProps["width"];
};

export default function Search({
  id,
  search,
  setSearch,
  width,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const handleHotKey = (e: KeyboardEvent): void => {
    e.preventDefault();
    ref?.current.focus();
  };

  // if we type a slash in an input, we don't want that to focus search
  useOnHotKey({ hotKey: "/", ignoreInput: true, onHotKey: handleHotKey });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  return (
    <Box
      margin={{ right: "small" }}
      style={{ position: "relative" }}
      width={width || "full"}
    >
      <SearchIcon
        color={colors.gray5}
        size={edgeSize.small}
        style={{
          left: edgeSize.xxsmall,
          position: "absolute",
          top: edgeSize.xxsmall,
        }}
      />
      <TextInput
        id={id}
        onChange={handleChange}
        pad={{ left: edgeSize.large, right: edgeSize.xlarge }}
        placeholder={copy.search}
        ref={ref}
        value={search}
      />
      <Box
        align="center"
        background="gray1"
        border={{ color: "gray3", size: borderSize.xsmall }}
        height={edgeSize.medium}
        justify="center"
        round={borderSize.small}
        style={{
          position: "absolute",
          right: edgeSize.xxxsmall,
          top: edgeSize.xxxsmall,
        }}
        width={edgeSize.medium}
      >
        <Text color="gray5" size="component">
          /
        </Text>
      </Box>
    </Box>
  );
}
