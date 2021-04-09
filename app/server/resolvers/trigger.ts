import { updateTeam } from "../models/team";
import {
  createTestTriggersForTrigger,
  deleteTestTriggersForTrigger,
} from "../models/test_trigger";
import {
  createTrigger,
  deleteTrigger,
  findTriggersForTeam,
  updateTrigger,
} from "../models/trigger";
import { trackSegmentEvent } from "../services/segment";
import {
  Context,
  CreateTriggerMutation,
  IdQuery,
  TeamIdQuery,
  Trigger,
  UpdateTriggerMutation,
} from "../types";
import { cuid } from "../utils";
import { ensureTeamAccess, ensureTriggerAccess, ensureUser } from "./utils";

/**
 * @returns The new trigger object
 */
export const createTriggerResolver = async (
  _: Record<string, unknown>,
  { team_id, test_ids, ...args }: CreateTriggerMutation,
  { db, logger, teams, user: contextUser }: Context
): Promise<Trigger> => {
  const log = logger.prefix("createTriggerResolver");

  const user = ensureUser({ logger, user: contextUser });
  const team = ensureTeamAccess({ logger, team_id: team_id, teams });

  log.debug(`user ${user.id} for team ${team_id}`);

  const trigger = await db.transaction(async (trx) => {
    const trigger = await createTrigger(
      { ...args, creator_id: user.id, id: team.next_trigger_id, team_id },
      { db: trx, logger }
    );

    await updateTeam(
      { id: team.id, next_trigger_id: cuid() },
      { db: trx, logger }
    );

    if (test_ids?.length) {
      await createTestTriggersForTrigger(
        { test_ids, trigger_id: trigger.id },
        { db: trx, logger }
      );
    }

    return trigger;
  });

  trackSegmentEvent(user, "Trigger Created");
  log.debug(`created trigger ${trigger.id} for team ${team_id}`);

  return trigger;
};

/**
 * @returns An object with default trigger and deleted trigger IDs
 */
export const deleteTriggerResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Trigger> => {
  const log = logger.prefix("deleteTriggerResolver");
  log.debug("trigger", id);

  await ensureTriggerAccess({ trigger_id: id, teams }, { db, logger });

  const trigger = await db.transaction(async (trx) => {
    await deleteTestTriggersForTrigger({ trigger_id: id }, { db: trx, logger });

    return deleteTrigger(id, { db: trx, logger });
  });

  log.debug("deleted trigger", id);

  return trigger;
};

/**
 * @returns An array of the non-deleted triggers for the team,
 *   sorted alphabetically ascending by name.
 */
export const triggersResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Trigger[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return findTriggersForTeam(team_id, { db, logger });
};

/**
 * @returns Updated trigger object
 */
export const updateTriggerResolver = async (
  _: Record<string, unknown>,
  args: UpdateTriggerMutation,
  { db, logger, teams }: Context
): Promise<Trigger> => {
  logger.debug("updateTriggerResolver", args.id);
  await ensureTriggerAccess({ teams, trigger_id: args.id }, { db, logger });

  return updateTrigger(args, { db, logger });
};
