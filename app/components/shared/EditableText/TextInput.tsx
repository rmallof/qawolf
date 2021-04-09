import { Box, Keyboard } from "grommet";
import { ChangeEvent, useRef } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { edgeSize } from "../../../theme/theme";
import AppTextInput from "../AppTextInput";

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  placeholder: string;
  value: string;
};

const width = "480px";

export default function TextInput({
  onChange,
  onSave,
  placeholder,
  value,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const handleBlur = (): void => {
    onSave();
    if (ref.current) ref.current.blur();
  };

  useOnClickOutside({ onClickOutside: handleBlur, ref });

  return (
    <Keyboard onEnter={onSave} onEsc={handleBlur}>
      <Box>
        <AppTextInput
          autoFocus
          onChange={onChange}
          pad={{ left: edgeSize.xxsmall, right: edgeSize.xxsmall }}
          placeholder={placeholder}
          ref={ref}
          size="componentHeader"
          value={value}
          width={width}
        />
      </Box>
    </Keyboard>
  );
}
