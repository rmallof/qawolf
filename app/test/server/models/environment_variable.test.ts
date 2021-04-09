import { decrypt } from "../../../server/models/encrypt";
import * as environmentVariableModel from "../../../server/models/environment_variable";
import { EnvironmentVariable } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTeam,
  buildUser,
  logger,
} from "../utils";

const {
  buildEnvironmentVariables,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
  findEnvironmentVariablesForEnvironment,
  findRunnerLocations,
  findSystemEnvironmentVariable,
  updateEnvironmentVariable,
} = environmentVariableModel;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  return db("environments").insert([
    buildEnvironment({}),
    buildEnvironment({ i: 2, name: "Production" }),
  ]);
});

describe("buildEnvironmentVariables", () => {
  beforeAll(async () => {
    await db("environments").insert(buildEnvironment({ i: 3, name: "Other" }));

    return db("environment_variables").insert([
      buildEnvironmentVariable({
        environment_id: "environmentId",
        name: "EMAIL",
        value: "staging@qawolf.com",
      }),
      buildEnvironmentVariable({
        environment_id: "environmentId",
        i: 2,
        name: "NODE_ENV",
        value: "staging",
      }),
      buildEnvironmentVariable({
        environment_id: "environmentId",
        i: 3,
        name: "PASSWORD",
        value: "staging_password",
      }),
      buildEnvironmentVariable({
        environment_id: "environment2Id",
        i: 4,
        name: "LOGIN_CODE",
        value: "production_login_code",
      }),
      buildEnvironmentVariable({
        environment_id: "environment2Id",
        i: 5,
        name: "PASSWORD",
        value: "production_password",
      }),
    ]);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await db("environment_variables").del();

    return db("environments").where({ id: "environment3Id" }).del();
  });

  it("builds environment variables for an environment", async () => {
    const { env, variables } = await buildEnvironmentVariables(
      { environment_id: "environment2Id" },
      options
    );

    expect(env).toBe(
      JSON.stringify({
        LOGIN_CODE: "production_login_code",
        PASSWORD: "production_password",
      })
    );

    expect(variables).toMatchObject([
      {
        name: "LOGIN_CODE",
        value: "production_login_code",
      },
      { name: "PASSWORD", value: "production_password" },
    ]);
  });

  it("includes custom variables with environment id", async () => {
    const { env } = await buildEnvironmentVariables(
      {
        custom_variables: {
          CUSTOM_VARIABLE: "custom_value",
          EMAIL: "custom@qawolf.com",
        },
        environment_id: "environmentId",
      },
      options
    );

    expect(env).toBe(
      JSON.stringify({
        EMAIL: "custom@qawolf.com",
        NODE_ENV: "staging",
        PASSWORD: "staging_password",
        CUSTOM_VARIABLE: "custom_value",
      })
    );
  });

  it("includes custom variables without environment id", async () => {
    const { env } = await buildEnvironmentVariables(
      {
        custom_variables: {
          CUSTOM_VARIABLE: "custom_value",
          EMAIL: "custom@qawolf.com",
        },
        environment_id: null,
      },
      options
    );

    expect(env).toBe(
      JSON.stringify({
        CUSTOM_VARIABLE: "custom_value",
        EMAIL: "custom@qawolf.com",
      })
    );
  });

  it("returns empty object if no environment variables for environment", async () => {
    const { env } = await buildEnvironmentVariables(
      { environment_id: "environment3Id" },
      options
    );

    expect(env).toBe("{}");
  });
});

describe("createEnvironmentVariable", () => {
  afterEach(() => db("environment_variables").del());

  it("creates an environment variable", async () => {
    await createEnvironmentVariable(
      {
        environment_id: "environmentId",
        name: "my Secret",
        team_id: "teamId",
        value: "spirit",
      },
      options
    );

    const environmentVariable = await db("environment_variables")
      .select("*")
      .first();

    expect(environmentVariable).toMatchObject({
      environment_id: "environmentId",
      is_system: false,
      name: "MY_SECRET",
      team_id: "teamId",
    });

    expect(environmentVariable.value).not.toBe("spirit");
    expect(decrypt(environmentVariable.value)).toBe("spirit");
  });

  it("does not create an environment variable if name taken for environment", async () => {
    await createEnvironmentVariable(
      {
        environment_id: "environmentId",
        name: "my_Secret",
        team_id: "teamId",
        value: "spirit",
      },
      options
    );

    const testFn = async (): Promise<EnvironmentVariable> => {
      return createEnvironmentVariable(
        {
          environment_id: "environmentId",
          name: "MY_SECRET",
          team_id: "teamId",
          value: "spirit",
        },
        options
      );
    };

    await expect(testFn()).rejects.toThrowError("variable name must be unique");
  });
});

describe("deleteEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({ i: 2 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("deletes an environment variable", async () => {
    await deleteEnvironmentVariable("environmentVariableId", options);
    const environmentVariables = await db("environment_variables").select("*");

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id" },
    ]);
  });
});

describe("findEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({ i: 2 }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds an environment variable", async () => {
    const environmentVariable = await findEnvironmentVariable(
      "environmentVariableId",
      options
    );

    expect(environmentVariable).toMatchObject({ id: "environmentVariableId" });
  });

  it("throws an error if environment variable not found", async () => {
    const testFn = async (): Promise<EnvironmentVariable> => {
      return findEnvironmentVariable("fakeId", options);
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});

describe("findEnvironmentVariablesForEnvironment", () => {
  beforeAll(() => {
    return db("environment_variables").insert([
      buildEnvironmentVariable({ name: "B_VAR", value: "another secret" }),
      buildEnvironmentVariable({ i: 2, name: "A_VAR" }),
      buildEnvironmentVariable({ i: 3, environment_id: "environment2Id" }),
    ]);
  });

  afterAll(() => db("environment_variables").del());

  it("finds environment variables for an environment", async () => {
    const environmentVariables = await findEnvironmentVariablesForEnvironment(
      "environmentId",
      options
    );

    expect(environmentVariables).toMatchObject([
      { id: "environmentVariable2Id", name: "A_VAR", value: "secret" },
      { id: "environmentVariableId", name: "B_VAR", value: "another secret" },
    ]);
  });
});

describe("findRunnerLocations", () => {
  beforeAll(() => {
    return db("environment_variables").insert({
      ...buildEnvironmentVariable({ name: "RUNNER_LOCATIONS" }),
      is_system: true,
      value: JSON.stringify({ secret: "value" }),
    });
  });

  afterAll(() => db("environment_variables").del());

  it("finds runner locations", async () => {
    const locations = await findRunnerLocations(options);

    expect(locations).toEqual({ secret: "value" });
  });
});

describe("findSystemEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert({
      ...buildEnvironmentVariable({ name: "SYSTEM_ENV" }),
      is_system: true,
    });
  });

  afterAll(() => db("environment_variables").del());

  it("finds a system environment variable", async () => {
    const environmentVariable = await findSystemEnvironmentVariable(
      "SYSTEM_ENV",
      options
    );

    expect(environmentVariable).toMatchObject({
      is_system: true,
      name: "SYSTEM_ENV",
    });
  });

  it("throws an error if environment variable not found", async () => {
    await expect(
      findSystemEnvironmentVariable("FAKE_NAME", options)
    ).rejects.toThrowError("not found");
  });
});

describe("updateEnvironmentVariable", () => {
  beforeAll(() => {
    return db("environment_variables").insert(buildEnvironmentVariable({}));
  });

  afterAll(() => db("environment_variables").del());

  it("updates an environment variable", async () => {
    const environmentVariable = await updateEnvironmentVariable(
      {
        id: "environmentVariableId",
        name: "NEW_NAME",
        value: "newValue",
      },
      options
    );

    expect(environmentVariable).toMatchObject({
      name: "NEW_NAME",
      value: "newValue",
    });

    const dbEnvironmentVariable = await findEnvironmentVariable(
      "environmentVariableId",
      options
    );

    expect(dbEnvironmentVariable.value).not.toBe("newValue");
    expect(decrypt(dbEnvironmentVariable.value)).toBe("newValue");
  });

  it("formats name if needed", async () => {
    const environmentVariable = await updateEnvironmentVariable(
      {
        id: "environmentVariableId",
        name: "another name",
        value: "newValue",
      },
      options
    );

    expect(environmentVariable.name).toBe("ANOTHER_NAME");
  });

  it("throws an error if name or value not provided", async () => {
    await expect(
      updateEnvironmentVariable(
        {
          id: "environmentVariableId",
          name: "",
          value: "newValue",
        },
        options
      )
    ).rejects.toThrowError("Must provide name and value");

    await expect(
      updateEnvironmentVariable(
        {
          id: "environmentVariableId",
          name: "NEW_NAME",
          value: "",
        },
        options
      )
    ).rejects.toThrowError("Must provide name and value");
  });
});
