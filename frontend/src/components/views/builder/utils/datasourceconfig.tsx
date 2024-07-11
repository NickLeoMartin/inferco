import React from "react";
import { fetchJSON, getServerUrl } from "../../../utils";
import { Button, Dropdown, Input, message, theme } from "antd";
import {
  CircleStackIcon,
  CpuChipIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { IDataSourceConfig, IStatus } from "../../../types";
import { Card, ControlRowView } from "../../../atoms";
import TextArea from "antd/es/input/TextArea";
import { appContext } from "../../../../hooks/provider";


export const sampleDataSourceConfig = (dataSourceType: string = "postgres") => {
  const postgresConfig: IDataSourceConfig = {
    type: "postgres",
  };
  const mySQLConfig: IDataSourceConfig = {
    type: "mysql",
  };

  switch (dataSourceType) {
    case "postgres":
      return postgresConfig;
    case "mysql":
      return mySQLConfig;
    default:
      return postgresConfig;
  }
};

const DataSourceTypeSelector = ({
  dataSource,
  setDataSource,
}: {
  dataSource: IDataSourceConfig;
  setDataSource: (newDataSource: IDataSourceConfig) => void;
}) => {
  const dataSourceTypes = [
    {
      label: "Postgres",
      value: "postgres",
      description: "A Postgres-compatible database",
      icon: <CircleStackIcon className="h-6 w-6 text-primary" />,
    },
    {
      label: "MySQL",
      value: "mysql",
      description: "A MySQL-compatible database",
      icon: <CircleStackIcon className="h-6 w-6 text-primary" />,
    },
  ];

  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    dataSource?.type
  );

  const dataSourceTypeRows = dataSourceTypes.map((dataSourceType: any, i: number) => {
    return (
      <li
        onMouseEnter={() => {
          setSelectedHint(dataSourceType.value);
        }}
        role="listitem"
        key={"datasourcetype" + i}
        className="w-36"
      >
        <Card
          active={selectedType === dataSourceType.value}
          className="h-full p-2 cursor-pointer"
          title={<div className="  ">{dataSourceType.label}</div>}
          onClick={() => {
            setSelectedType(dataSourceType.value);
            if (dataSource) {
              const sampleDataSource = sampleDataSourceConfig(dataSourceType.value);
              setDataSource(sampleDataSource);
            }
          }}
        >
          <div style={{ minHeight: "35px" }} className="my-2   break-words ">
            {" "}
            <div className="mb-2">{dataSourceType.icon}</div>
            <span className="text-secondary  tex-sm">
              {" "}
              {dataSourceType.description}
            </span>
          </div>
        </Card>
      </li>
    );
  });

  const hints: any = {
    postgres:
      "During beta, it is recommended to add read-only credentials.",
    mysql: "During beta, it is recommended to add read-only credentials.",
  };

  const [selectedHint, setSelectedHint] = React.useState<string>("open_ai");

  return (
    <>
      <div className="pb-3">Select Data Source Type</div>
      <ul className="inline-flex gap-2">{dataSourceTypeRows}</ul>

      <div className="text-xs mt-4">
        <InformationCircleIcon className="h-4 w-4 inline mr-1 -mt-1" />
        {hints[selectedHint]}
      </div>
    </>
  );
};

const DataSourceConfigMainView = ({
  dataSource,
  setDataSource,
  close,
}: {
  dataSource: IDataSourceConfig;
  setDataSource: (newDataSource: IDataSourceConfig) => void;
  close: () => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [dataSourceStatus, setDataSourceStatus] = React.useState<IStatus | null>(null);
  const serverUrl = getServerUrl();
  const { user } = React.useContext(appContext);
  const testDataSourceUrl = `${serverUrl}/data-sources/test`;
  const createDataSourcelUrl = `${serverUrl}/data-sources`;

  //   const [model, setmodel] = React.useState<IModelConfig | null>(
  //     model
  //   );
  const testDataSource = (dataSource: IDataSourceConfig) => {
    setDataSourceStatus(null);
    setLoading(true);
    dataSource.user_id = user?.email;
    const payLoad = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataSource),
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        message.success(data.message);
        setDataSourceStatus(data.data);
      } else {
        message.error(data.message);
      }
      setLoading(false);
      setDataSourceStatus(data);
    };
    const onError = (err: any) => {
      message.error(err.message);
      setLoading(false);
    };
    fetchJSON(testDataSourceUrl, payLoad, onSuccess, onError);
  };
  const createDataSource = (model: IDataSourceConfig) => {
    setLoading(true);
    model.user_id = user?.email;
    const payLoad = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        message.success(data.message);
        setDataSource(data.data);
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };
    const onError = (err: any) => {
      message.error(err.message);
      setLoading(false);
    };
    const onFinal = () => {
      setLoading(false);
      setControlChanged(false);
    };
    fetchJSON(createDataSourcelUrl, payLoad, onSuccess, onError, onFinal);
  };

  const [controlChanged, setControlChanged] = React.useState<boolean>(false);

  const updateDataSourceConfig = (key: string, value: string) => {
    if (dataSource) {
      const updatedDataSourceConfig = { ...dataSource, [key]: value };
      //   setmodel(updatedModelConfig);
      setDataSource(updatedDataSourceConfig);
    }
    setControlChanged(true);
  };

  const hasChanged = !controlChanged && dataSource.id !== undefined;

  return (
    <div className="relative ">
      <div className="text-sm my-2">
        Enter parameters for your{" "}
        <span className="mx-1 text-accent">{dataSource.type}</span> data source.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <ControlRowView
            title="Data Source"
            className=""
            description="Source name"
            value={dataSource?.type || ""}
            control={
              <Input
                className="mt-2 w-full"
                value={dataSource?.type}
                onChange={(e) => {
                  updateDataSourceConfig("name", e.target.value);
                }}
              />
            }
          />

          <ControlRowView
            title="Host URL"
            className=""
            description="Host URL for database"
            value={dataSource?.host || ""}
            control={
              <Input
                className="mt-2 w-full"
                value={dataSource?.host}
                onChange={(e) => {
                  updateDataSourceConfig("host", e.target.value);
                }}
              />
            }
          />

          <ControlRowView
            title="Database Name"
            className=""
            description="Name of database"
            value={dataSource?.name || ""}
            // truncateLength={5}
            control={
              <Input
                className="mt-2 w-full"
                value={dataSource?.name}
                onChange={(e) => {
                  updateDataSourceConfig("name", e.target.value);
                }}
              />
            }
          />
        </div>

        <div>
          <ControlRowView
            title="Password"
            className=""
            description="Password for database"
            value={dataSource?.password || ""}
            // truncateLength={5}
            control={
              <Input.Password
                className="mt-2 w-full"
                value={dataSource?.password}
                onChange={(e) => {
                  updateDataSourceConfig("password", e.target.value);
                }}
              />
            }
          />

          <ControlRowView
            title="Username"
            className=""
            description="Username accessing database"
            value={dataSource?.username || ""}
            // truncateLength={5}
            control={
              <Input
                className="mt-2 w-full"
                value={dataSource?.username}
                onChange={(e) => {
                  updateDataSourceConfig("username", e.target.value);
                }}
              />
            }
          />
          <ControlRowView
            title="Port"
            className=""
            description="Port to access database"
            value={dataSource?.port || ""}
            // truncateLength={5}
            control={
              <Input
                className="mt-2 w-full"
                value={dataSource?.port}
                onChange={(e) => {
                  updateDataSourceConfig("port", e.target.value);
                }}
              />
            }
          />
          {/* {dataSource?.type == "azure" && (
            <ControlRowView
              title="API Version"
              className=" "
              description="API Version, required by Azure Models"
              value={dataSource?.api_version || ""}
              control={
                <Input
                  className="mt-2 w-full"
                  value={dataSource?.api_version}
                  onChange={(e) => {
                    updateDataSourceConfig("api_version", e.target.value);
                  }}
                />
              }
            />
          )} */}
        </div>
      </div>

      {/* <ControlRowView
        title="Description"
        className="mt-4"
        description="Description of the model"
        value={dataSource?.name || ""}
        control={
          <TextArea
            className="mt-2 w-full"
            value={dataSource?.name}
            onChange={(e) => {
              updateDataSourceConfig("description", e.target.value);
            }}
          />
        }
      /> */}

      {/* {model?.api_type === "azure" && (
        <div className="mt-4 text-xs">
          Note: For Azure OAI models, you will need to specify all fields.
        </div>
      )} */}

      {dataSourceStatus && (
        <div
          className={`text-sm border mt-4 rounded text-secondary p-2 ${dataSourceStatus.status ? "border-accent" : " border-red-500 "
            }`}
        >
          <InformationCircleIcon className="h-4 w-4 inline mr-1" />
          {dataSourceStatus.message}

          {/* <span className="block"> Note </span> */}
        </div>
      )}

      <div className="w-full mt-4 text-right">
        <Button
          key="test"
          type="primary"
          loading={loading}
          onClick={() => {
            if (dataSource) {
              testDataSource(dataSource);
            }
          }}
        >
          Test Connection
        </Button>

        {!hasChanged && (
          <Button
            className="ml-2"
            key="save"
            type="primary"
            onClick={() => {
              if (dataSource) {
                createDataSource(dataSource);
                setDataSource(dataSource);
              }
            }}
          >
            {dataSource?.id ? "Update Data Source" : "Save Data Source"}
          </Button>
        )}

        <Button
          className="ml-2"
          key="close"
          type="default"
          onClick={() => {
            close();
          }}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export const DataSourceConfigView = ({
  dataSource,
  setDataSource,
  close,
}: {
  dataSource: IDataSourceConfig;
  setDataSource: (newDataSource: IDataSourceConfig) => void;
  close: () => void;
}) => {
  return (
    <div className="text-primary">
      <div>
        {!dataSource?.type && (
          <DataSourceTypeSelector dataSource={dataSource} setDataSource={setDataSource} />
        )}

        {dataSource?.type && dataSource && (
          <DataSourceConfigMainView
            dataSource={dataSource}
            setDataSource={setDataSource}
            close={close}
          />
        )}
      </div>
    </div>
  );
};
