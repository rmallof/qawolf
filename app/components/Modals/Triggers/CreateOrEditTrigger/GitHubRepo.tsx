import { Box } from "grommet";
import { Github } from "grommet-icons";
import { useContext, useEffect, useState } from "react";

import { useIntegrations } from "../../../../hooks/queries";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Select from "../../../shared/Select";
import Option from "../../../shared/Select/Option";
import Text from "../../../shared/Text";
import { StateContext } from "../../../StateContext";
import { labelTextProps } from "../helpers";

type Props = {
  deployIntegrationId: string | null;
  hasError?: boolean;
  label?: string;
  setDeployIntegrationId: (integrationId: string | null) => void;
};

export default function GitHubRepo({
  deployIntegrationId,
  hasError,
  label,
  setDeployIntegrationId,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);
  const [isGitHubClicked, setIsGitHubClicked] = useState(false);

  const { data, startPolling, stopPolling } = useIntegrations({
    team_id: teamId || "",
  });
  const gitHubIntegrations = (data?.integrations || []).filter(
    (i) => i.type === "github"
  );

  // get latest integrations if they open GitHub
  useEffect(() => {
    if (isGitHubClicked) startPolling(2000);

    return () => {
      stopPolling();
    };
  }, [isGitHubClicked, startPolling, stopPolling]);

  // choose a GitHub repo if possible
  useEffect(() => {
    if (!deployIntegrationId && gitHubIntegrations.length) {
      setDeployIntegrationId(gitHubIntegrations[0].id);
    }
  }, [deployIntegrationId, gitHubIntegrations, setDeployIntegrationId]);

  const handleGitHubClick = (): void => {
    setIsGitHubClicked(true);
    window.open(process.env.NEXT_PUBLIC_GITHUB_APP_URL, "_blank");
  };

  const buttonProps = {
    IconComponent: Github,
    onClick: handleGitHubClick,
    type: "secondary" as const,
  };

  const selectLabel =
    gitHubIntegrations.find((i) => i.id === deployIntegrationId)
      ?.github_repo_name || copy.chooseGitHubRepo;

  const optionsHtml = gitHubIntegrations.map((i) => {
    return (
      <Option
        isSelected={i.id === deployIntegrationId}
        key={i.id}
        label={i.github_repo_name}
        onClick={() => setDeployIntegrationId(i.id)}
      />
    );
  });

  return (
    <>
      <Text {...labelTextProps}>{label || copy.gitHubRepo}</Text>
      {gitHubIntegrations.length ? (
        <Box align="center" direction="row">
          <Button {...buttonProps} margin={{ right: "xxsmall" }} />
          <Select hasError={hasError} label={selectLabel}>
            {optionsHtml}
          </Select>
        </Box>
      ) : (
        <Button
          {...buttonProps}
          hasError={hasError}
          justify="center"
          label={data?.integrations ? copy.connectGitHubRepo : copy.loading}
        />
      )}
    </>
  );
}
