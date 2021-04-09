import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.string("inbox").unique();
  });

  const exists = await knex.schema.hasTable("emails");
  if (exists) return;

  return knex.schema.createTable("emails", (table) => {
    table.string("id").primary();
    table.text("from").notNullable();
    table.text("html").notNullable().defaultTo("");
    table.text("subject").notNullable().defaultTo("");
    table.string("team_id").notNullable().references("id").inTable("teams");
    table.text("text").notNullable().defaultTo("");
    table.string("to").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("inbox");
  });

  const exists = await knex.schema.hasTable("emails");
  if (!exists) return;

  return knex.schema.dropTable("emails");
}
