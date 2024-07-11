import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button, Dropdown, Input, MenuProps, Modal, message } from "antd";
import * as React from "react";
import { IDataSourceConfig, IStatus } from "../../types";
import { appContext } from "../../../hooks/provider";
import {
  fetchJSON,
  getServerUrl,
  sanitizeConfig,
  timeAgo,
  truncateText,
} from "../../utils";
import {
  BounceLoader,
  Card,
  CardHoverBar,
  ControlRowView,
  LoadingOverlay,
} from "../../atoms";
import TextArea from "antd/es/input/TextArea";
import { DataSourceConfigView } from "./utils/datasourceconfig";

const DataSourcesView = ({ }: any) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<IStatus | null>({
    status: true,
    message: "All good",
  });
  const { user } = React.useContext(appContext);
  const serverUrl = getServerUrl();

  const listDataSourcesUrl = `${serverUrl}/data-sources?user_id=${user?.email}`;
  const createDataSourcesUrl = `${serverUrl}/data-sources`;
  const testDataSourcesUrl = `${serverUrl}/data-sources/test`;

  // TODO: fix later...
  const defaultDataSource: IDataSourceConfig = {
    // type: "postgres",
    // name: "Operational Database",
    // user_id: user?.email,
  };

  const [dataSources, setDataSources] = React.useState<IDataSourceConfig[] | null>([]);
  const [selectedDataSource, setSelectedDataSource] = React.useState<IDataSourceConfig | null>(
    null
  );
  const [newDataSource, setNewDataSource] = React.useState<IDataSourceConfig | null>(
    defaultDataSource
  );

  const [showNewDataSourceModal, setShowNewDataSourceModal] = React.useState(false);
  const [showDataSourceModal, setShowDataSourceModal] = React.useState(false);

  const deleteDataSource = (model: IDataSourceConfig) => {
    setError(null);
    setLoading(true);
    const deleteDataSourceUrl = `${serverUrl}/data-sources/delete?user_id=${user?.email}&model_id=${model.id}`;
    const payLoad = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        message.success(data.message);
        fetchDataSources();
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };
    const onError = (err: any) => {
      setError(err);
      message.error(err.message);
      setLoading(false);
    };
    fetchJSON(deleteDataSourceUrl, payLoad, onSuccess, onError);
  };

  const fetchDataSources = () => {
    setError(null);
    setLoading(true);
    const payLoad = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        setDataSources(data.data);
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };
    const onError = (err: any) => {
      setError(err);
      message.error(err.message);
      setLoading(false);
    };
    fetchJSON(listDataSourcesUrl, payLoad, onSuccess, onError);
  };

  const createDataSource = (model: IDataSourceConfig) => {
    setError(null);
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
        const updatedDataSources = [data.data].concat(dataSources || []);
        setDataSources(updatedDataSources);
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };
    const onError = (err: any) => {
      setError(err);
      message.error(err.message);
      setLoading(false);
    };
    fetchJSON(createDataSourcesUrl, payLoad, onSuccess, onError);
  };

  React.useEffect(() => {
    if (user) {
      // console.log("fetching messages", messages);
      fetchDataSources();
    }
  }, []);

  const dataSourceRows = (dataSources || []).map((dataSource: IDataSourceConfig, i: number) => {
    const cardItems = [
      {
        title: "Download",
        icon: ArrowDownTrayIcon,
        onClick: (e: any) => {
          e.stopPropagation();
          // download workflow as workflow.name.json
          const element = document.createElement("a");
          const sanitizedSkill = sanitizeConfig(dataSource);
          const file = new Blob([JSON.stringify(sanitizedSkill)], {
            type: "application/json",
          });
          element.href = URL.createObjectURL(file);
          element.download = `data_source_${dataSource.type}.json`;
          document.body.appendChild(element); // Required for this to work in FireFox
          element.click();
        },
        hoverText: "Download",
      },
      {
        title: "Make a Copy",
        icon: DocumentDuplicateIcon,
        onClick: (e: any) => {
          e.stopPropagation();
          let newDataSource = { ...dataSource };
          newDataSource.type = `${dataSource.type}`;
          newDataSource.user_id = user?.email;
          newDataSource.updated_at = new Date().toISOString();
          if (newDataSource.id) {
            delete newDataSource.id;
          }
          setNewDataSource(newDataSource);
          setShowNewDataSourceModal(true);
        },
        hoverText: "Make a Copy",
      },
      {
        title: "Delete",
        icon: TrashIcon,
        onClick: (e: any) => {
          e.stopPropagation();
          deleteDataSource(dataSource);
        },
        hoverText: "Delete",
      },
    ];
    return (
      <li
        role="listitem"
        key={"datasourcerow" + i}
        className=" "
        style={{ width: "200px" }}
      >
        <Card
          className="h-full p-2 cursor-pointer"
          title={
            <div className="  ">{truncateText(dataSource.type || "", 20)}</div>
          }
          onClick={() => {
            setSelectedDataSource(dataSource);
            setShowDataSourceModal(true);
          }}
        >
          <div style={{ minHeight: "65px" }} className="my-2   break-words">
            {" "}
            {truncateText(dataSource.name || dataSource.type || "", 70)}
          </div>
          <div
            aria-label={`Updated ${timeAgo(dataSource.updated_at || "")} `}
            className="text-xs"
          >
            {timeAgo(dataSource.updated_at || "")}
          </div>
          <CardHoverBar items={cardItems} />
        </Card>
      </li>
    );
  });

  const DataSourceModal = ({
    dataSource,
    setDataSource,
    showDataSourceModal,
    setShowDataSourceModal,
    handler,
  }: {
    dataSource: IDataSourceConfig;
    setDataSource: (dataSource: IDataSourceConfig | null) => void;
    showDataSourceModal: boolean;
    setShowDataSourceModal: (show: boolean) => void;
    handler?: (agent: IDataSourceConfig) => void;
  }) => {
    const [localDataSource, setLocalDataSource] = React.useState<IDataSourceConfig>(dataSource);

    const closeModal = () => {
      setDataSource(null);
      setShowDataSourceModal(false);
      if (handler) {
        handler(dataSource);
      }
    };

    return (
      <Modal
        title={
          <>
            Data Source Specification{" "}
            <span className="text-accent font-normal">{dataSource?.type}</span>{" "}
          </>
        }
        width={800}
        open={showDataSourceModal}
        footer={[]}
        onOk={() => {
          closeModal();
        }}
        onCancel={() => {
          closeModal();
        }}
      >
        {dataSource && (
          <DataSourceConfigView
            dataSource={localDataSource}
            setDataSource={setLocalDataSource}
            close={closeModal}
          />
        )}
      </Modal>
    );
  };

  return (
    <div className="text-primary  ">
      {selectedDataSource && (
        <DataSourceModal
          dataSource={selectedDataSource}
          setDataSource={setSelectedDataSource}
          setShowDataSourceModal={setShowDataSourceModal}
          showDataSourceModal={showDataSourceModal}
          handler={(dataSource: IDataSourceConfig | null) => {
            fetchDataSources();
          }}
        />
      )}
      <DataSourceModal
        dataSource={newDataSource || defaultDataSource}
        setDataSource={setNewDataSource}
        setShowDataSourceModal={setShowNewDataSourceModal}
        showDataSourceModal={showNewDataSourceModal}
        handler={(dataSource: IDataSourceConfig | null) => {
          fetchDataSources();
        }}
      />

      <div className="mb-2   relative">
        <div className="     rounded  ">
          <div className="flex mt-2 pb-2 mb-2 border-b">
            <div className="flex-1 font-semibold mb-2 ">
              {" "}
              Data Sources ({dataSourceRows.length}){" "}
            </div>
            <div>
              <Button
                type="primary"
                onClick={() => {
                  setShowNewDataSourceModal(true);
                }}
              >
                <PlusIcon className="w-5 h-5 inline-block mr-1" />
                New Data Source
              </Button>
            </div>
          </div>

          <div className="text-xs mb-2 pb-1  ">
            {" "}
            Create data source configurations that can be used by your agents and
            workflows. {selectedDataSource?.type}
          </div>
          {dataSources && dataSources.length > 0 && (
            <div className="w-full  relative">
              <LoadingOverlay loading={loading} />
              <ul className="   flex flex-wrap gap-3">{dataSourceRows}</ul>
            </div>
          )}

          {dataSources && dataSources.length === 0 && !loading && (
            <div className="text-sm border mt-4 rounded text-secondary p-2">
              <InformationCircleIcon className="h-4 w-4 inline mr-1" />
              No data sources found. Please create a new data source which can be used
              with agents.
            </div>
          )}

          {loading && (
            <div className="  w-full text-center">
              {" "}
              <BounceLoader />{" "}
              <span className="inline-block"> loading .. </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSourcesView;
