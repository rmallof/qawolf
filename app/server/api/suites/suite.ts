import pick from "lodash/pick";
import { NextApiRequest, NextApiResponse } from "next";

import { ApiAuthenticationError } from "../../errors";
import { findRunsForSuite } from "../../models/run";
import { findSuite } from "../../models/suite";
import { validateApiKeyForTeam } from "../../models/team";
import { ModelOptions, RunStatus, Suite, SuiteRun } from "../../types";

// errors example: https://stripe.com/docs/api/errors
const ensureSuiteAccess = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<Suite> => {
  const log = options.logger.prefix("ensureSuiteAccess");

  const api_key = req.headers.authorization;
  const suite_id = req.query.suite_id as string;

  if (!api_key) {
    log.error("no api key provided");
    throw new ApiAuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  if (!suite_id) {
    log.error("no suite id provided");
    throw new ApiAuthenticationError({
      code: 400,
      message: "No suite id provided",
    });
  }

  try {
    const suite = await findSuite(suite_id, options);

    await validateApiKeyForTeam({ api_key, team_id: suite.team_id }, options);

    log.debug("has access", suite.id);

    return suite;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("suite not found");
      throw new ApiAuthenticationError({
        code: 404,
        message: "Invalid suite id",
      });
    }

    log.error("invalid api key");
    throw new ApiAuthenticationError({
      code: 403,
      message: "API key cannot get suite",
    });
  }
};

export const getStatusForSuite = (runs: SuiteRun[]): RunStatus => {
  if (runs.some((r) => r.status === "created")) return "created";
  if (runs.some((r) => r.status === "fail")) return "fail";

  return "pass";
};

export const handleSuiteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleSuiteRequest");

  try {
    log.debug("query", req.query);

    const { id } = await ensureSuiteAccess(req, options);

    const runs = await findRunsForSuite(id, options);
    const formattedRuns = runs.map((r) =>
      pick(r, ["id", "status", "test_name"])
    );

    const status = getStatusForSuite(runs);
    const is_complete = status !== "created";

    res.status(200).send({ id, is_complete, runs: formattedRuns, status });

    log.debug("completed");
  } catch (error) {
    log.alert("get suite error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};
