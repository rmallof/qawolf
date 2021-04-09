import { Box } from "grommet";

import { durationToText, timestampToText } from "../../../lib/helpers";
import { Run, Suite } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme";
import LabeledBox from "../../shared/LabeledBox";
import StatusBadge from "../../shared/StatusBadge";
import Text from "../../shared/Text";
import TriggerBadge from "../../shared/TriggerBadge";

type Props = {
  run: Run;
  suite: Suite | null;
};

const rightMargin = { right: "large" };

export default function RunSummary({ run, suite }: Props): JSX.Element {
  const startedAt = run.started_at
    ? timestampToText(run.started_at)
    : copy.notStarted;

  let duration = copy.notStarted;

  if (run.started_at && run.completed_at) {
    duration = durationToText(run.started_at, run.completed_at);
  } else if (run.started_at) {
    duration = copy.inProgress;
  }

  return (
    <Box
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      pad="small"
    >
      <LabeledBox label={copy.trigger} margin={rightMargin}>
        <TriggerBadge isLoading={!suite} trigger={suite?.trigger || null} />
      </LabeledBox>
      <LabeledBox label={copy.status} margin={rightMargin}>
        <StatusBadge status={run.status} />
      </LabeledBox>
      <LabeledBox label={copy.startedAt} margin={rightMargin}>
        <Text color="gray9" size="component">
          {startedAt}
        </Text>
      </LabeledBox>
      <LabeledBox label={copy.duration}>
        <Text color="gray9" size="component">
          {duration}
        </Text>
      </LabeledBox>
    </Box>
  );
}
