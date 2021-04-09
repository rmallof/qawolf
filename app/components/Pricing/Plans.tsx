import { Box } from "grommet";
import styled from "styled-components";

import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import { breakpoints, edgeSize } from "../../theme/theme";
import Section from "../shared/Section";
import Text from "../shared/Text";
import OpenSource from "./OpenSource";
import Plan, { PlanType } from "./Plan";
import SubscribeButton from "./SubscribeButton";

const plans: PlanType[] = [
  {
    highlight: false,
    href: routes.signUp,
    label: copy.getStarted,
    name: "Starter",
    price: "Free",
    valueProps: [copy.testRunsStarter, copy.communitySupport],
  },
  {
    highlight: true,
    name: "Business",
    price: 40,
    valueProps: [
      copy.testRunsBusiness,
      copy.testRunsBusinessExtra,
      copy.prioritySupport,
    ],
  },
  {
    highlight: false,
    href: "mailto:hello@qawolf.com",
    label: copy.contactUs,
    name: "Enterprise",
    price: "Custom",
    valueProps: [copy.implementation, copy.openVpn, copy.dedicatedSupport],
  },
];

const StyledBox = styled(Box)`
  flex-direction: column;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: ${edgeSize.xlarge};
  }
`;

export default function Plans(): JSX.Element {
  const plansHtml = plans.map((plan) => {
    if (plan.name.toLowerCase() === "business") {
      return (
        <Plan key={plan.name} plan={plan}>
          <SubscribeButton />
        </Plan>
      );
    }

    return <Plan key={plan.name} plan={plan} />;
  });

  return (
    <Section background="white">
      <Text color="textDark" size="large" weight="bold">
        {copy.pricing}
      </Text>
      <StyledBox margin={{ top: "xxlarge" }} width="full">
        {plansHtml}
      </StyledBox>
      <OpenSource />
    </Section>
  );
}
