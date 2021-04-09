import { Box } from "grommet";
import { ChangeEvent, useContext, useState } from "react";

import { useDeleteEnvironment } from "../../../../hooks/mutations";
import { MutableListFields } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared/AppTextInput";
import ConfirmDelete from "../../../shared/Modal/ConfirmDelete";
import Header from "../../../shared/Modal/Header";
import Text from "../../../shared/Text";
import { StateContext } from "../../../StateContext";

type Props = {
  closeModal: () => void;
  environment: MutableListFields;
  onClose: (deletedEnvironmentId?: string) => void;
};

export default function ConfirmDeleteEnvironment({
  closeModal,
  environment,
  onClose,
}: Props): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const [deleteEnvironment, { loading }] = useDeleteEnvironment({
    currentEnvironmentId: environmentId,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleDelete = (): void => {
    if (name.toLowerCase() !== environment.name.toLowerCase()) {
      setError(copy.mustMatch);
      return;
    }

    setError("");
    deleteEnvironment({ variables: { id: environment.id } }).then(
      (response) => {
        onClose(response?.data?.deleteEnvironment.id);
      }
    );
  };

  return (
    <Box pad="medium">
      <Header closeModal={closeModal} label={copy.environmentDelete} />
      <ConfirmDelete
        isDeleteDisabled={loading}
        onCancel={onClose}
        onDelete={handleDelete}
      >
        <Text
          color="gray9"
          margin={{ bottom: "medium", top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.environmentDeleteConfirm} <b>{environment.name}</b>{" "}
          {copy.environmentDeleteConfirm2}
        </Text>
        <TextInput
          autoFocus
          error={error}
          onChange={handleChange}
          placeholder={environment.name}
          value={name}
        />
      </ConfirmDelete>
    </Box>
  );
}
