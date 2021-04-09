import { slug } from "cuid";

import { Email } from "../types";
import { pollForEmail, sendEmail } from "./api";

export type GetInbox = {
  id?: string;
  new?: boolean;
};

type GetInboxContext = {
  apiKey: string;
  inbox: string;
};

type GetInboxResult = {
  email: string;
  sendMessage: (options: SendMessage) => Promise<Email>;
  waitForMessage: (options: WaitForMessage) => Promise<Email>;
};

type SendMessage = {
  html?: string;
  subject: string;
  text?: string;
  to: string;
};

type WaitForMessage = {
  after?: Date;
  timeout?: number;
};

export const getInbox = (
  args: GetInbox = {},
  context: GetInboxContext
): GetInboxResult => {
  const apiKey = context.apiKey;
  const calledAt = new Date();
  let email = context.inbox;
  if (args.id || args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${args.id || slug()}@${domain}`;
  }

  const sendMessage = (options: SendMessage): Promise<Email> => {
    if (!options.to) throw new Error("must include the to field");
    if (!options.subject) throw new Error("must include the subject field");
    if (!options.html && !options.text) {
      throw new Error("must include the html field or text field");
    }

    return sendEmail({
      ...options,
      apiKey,
      from: email,
    });
  };

  const waitForMessage = ({
    after,
    timeout,
  }: WaitForMessage = {}): Promise<Email> => {
    if (after && !(after instanceof Date)) {
      throw new Error("after must be a Date");
    }

    return pollForEmail({
      apiKey,
      createdAfter: after || calledAt,
      timeoutMs: timeout || 60000,
      to: email,
    });
  };

  return { email, sendMessage, waitForMessage };
};
