import { ActionIcon, Box, Button, Checkbox, Group, Modal, Select, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useRequest } from "ahooks";
import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardAPI } from "../../api-caller/dashboard";

interface IFormValues {
  name: string;
  idToDuplicate: string;
}

function CreateDashboardForm({ postSubmit }: { postSubmit: () => void }) {
  const navigate = useNavigate();

  const { data: options = [], loading } = useRequest(async () => {
    const { data } = await DashboardAPI.list();
    return data.map(d => ({
      label: d.name,
      value: d.id,
      content: d.content,
    }))
  }, {
    refreshDeps: [],
  });

  const { control, handleSubmit, watch, getValues } = useForm<IFormValues>({
    defaultValues: {
      name: '',
      idToDuplicate: '',
    }
  });

  const createDashboard = async ({ name, idToDuplicate }: IFormValues) => {
    showNotification({
      id: 'for-creating',
      title: 'Pending',
      message: 'Creating dashboard...',
      loading: true,
    })
    const dashboard = options.find(o => o.value === idToDuplicate)
    const content = dashboard?.content;
    const { id } = await DashboardAPI.create(name, content);
    updateNotification({
      id: 'for-creating',
      title: 'Successful',
      message: 'A new dashboard is created',
      color: 'green'
    })
    postSubmit()
    navigate(`/${id}`)
  }
  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(createDashboard)}>
        <Controller
          name='name'
          control={control}
          render={(({ field }) => (
            <TextInput
              mb="md"
              required
              label="Name"
              placeholder="Name the dashboard"
              {...field}
            />
          ))}
        />
        <Controller
          name='idToDuplicate'
          control={control}
          render={(({ field }) => (
            <Select
              my="md"
              data={options}
              disabled={loading}
              label="Choose a dashboard to duplicate (optional)"
              {...field}
            />
          ))}
        />

        <Group position="right" mt="md">
          <Button type="submit">Confirm</Button>
        </Group>
      </form>
    </Box>
  )
}

interface ICreateDashboard {
}

export function CreateDashboard({ }: ICreateDashboard) {
  const [opened, setOpened] = React.useState(false);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  return (
    <>
      <Modal
        overflow="inside"
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create a Dashboard"
        trapFocus
        onDragStart={e => { e.stopPropagation() }}
      >
        <CreateDashboardForm postSubmit={close} />
      </Modal>
      <Button color="blue" onClick={open}>Create</Button>
    </>
  )
}