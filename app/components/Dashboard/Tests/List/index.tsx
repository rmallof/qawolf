import { Box } from "grommet";
import { useRouter } from "next/router";

import { useTestSummaries } from "../../../../hooks/queries";
import { Group, ShortTest, TestTriggers, Trigger } from "../../../../lib/types";
import { borderSize } from "../../../../theme/theme";
import Spinner from "../../../shared/Spinner";
import { noTriggerId } from "../../helpers";
import Header from "./Header";
import TestCard from "./TestCard";

type Props = {
  checkedTestIds: string[];
  groups: Group[] | null;
  setCheckedTestIds: (testIds: string[]) => void;
  testIds: string[];
  tests: ShortTest[] | null;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function List({
  checkedTestIds,
  groups,
  setCheckedTestIds,
  testIds,
  tests,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const { query } = useRouter();

  const trigger_id =
    query.trigger_id === noTriggerId
      ? null
      : (query.trigger_id as string) || null;

  const { data, loading } = useTestSummaries(
    {
      // tests includes only filtered tests, so do not rerun query just if search changes
      test_ids: testIds,
      trigger_id,
    },
    { pollInterval: 10 * 1000 }
  );

  if (!tests) return <Spinner />;

  const handleTestCheck = (testId: string): void => {
    const index = checkedTestIds.indexOf(testId);
    if (index > -1) {
      const newSelectedTestIds = [...checkedTestIds];
      newSelectedTestIds.splice(index, 1);

      setCheckedTestIds(newSelectedTestIds);
    } else {
      setCheckedTestIds([...checkedTestIds, testId]);
    }
  };

  const testsHtml = tests.map((test, i) => {
    const triggerIds =
      testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];
    const filteredTriggers = triggers.filter((t) => triggerIds.includes(t.id));

    const groupName = groups?.find((g) => g.id === test.group_id)?.name || null;
    const summary = (data?.testSummaries || []).find(
      (s) => s.test_id === test.id
    );

    return (
      <TestCard
        groupName={groupName}
        hasGroups={!!groups?.length}
        isChecked={checkedTestIds.includes(test.id)}
        isSummaryLoading={loading}
        key={test.id}
        noBorder={!i}
        onCheck={() => handleTestCheck(test.id)}
        summary={summary || null}
        test={test}
        triggers={filteredTriggers}
      />
    );
  });

  return (
    <Box
      border={{ color: "gray3", size: borderSize.xsmall }}
      margin={{ top: "medium" }}
      round={borderSize.small}
    >
      <Header
        checkedTestIds={checkedTestIds}
        setCheckedTestIds={setCheckedTestIds}
        tests={tests}
      />
      <Box overflow={{ vertical: "auto" }}>
        <Box flex={false}>{testsHtml}</Box>
      </Box>
    </Box>
  );
}
