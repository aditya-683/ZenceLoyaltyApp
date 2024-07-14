import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  DataTable,
  Spinner,
  Tag,
  Autocomplete,
  Icon,
  Select,
  VerticalStack,
  AlphaCard,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorComponent } from "./ErrorComponent";

import { getDateTimestamp, getShopNameFromUrl } from "../../utils/utility.js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import axios from "axios";

let timer;

export function CartAttributeTables() {
  const [topic, setTopic] = useState("");
  const [storeInfos, setStoreInfos] = useState(null);
  const [sortedRows, setSortedRows] = useState(null);
  const [initiallySortedRows, setInitiallySortedRows] = useState([]);
  const [Count, setCount] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [btnLoadingState, setBtnLoadingState] = useState(false);
  const [reload, setReload] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [itemsPerPage, setItemPerPage] = useState(20);
  const [selected, setSelected] = useState("None");
  const subscriptionRef = useRef(null);
  const authFetch = useAuthenticatedFetch();

  /* Data Table Declarations */
  const rows = sortedRows ? sortedRows : initiallySortedRows;
  const handleSort = useCallback(
    (index, direction) => setSortedRows(sortDate(rows, index, direction)),
    [rows]
  );

  /* Error Defination */
  const [Error, setError] = useState({
    code: "",
    message: "",
  });

  const getCartData = async (searchQuery) => {
    try {
      const store = getShopNameFromUrl(location.href);
      let endPoint = `getAllCartAttributes?count=${itemsPerPage}&skip=${
        itemsPerPage * pageNumber
      }`;

      if (searchQuery)
        endPoint = `getACartAttribute?store=${store}&search=${searchQuery}&count=${itemsPerPage}&skip=${
          itemsPerPage * pageNumber
        }`;

      setLoadingOrders(true);

      const storeName = getShopNameFromUrl(location.href);
      // const res = await axios.post(`/api/${endPoint}`,{
      //   store: storeName,
      // }
      const fetchResponse = await authFetch(`/api/${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store: storeName,
        }),
      });

      const res = await fetchResponse.json();

      // console.log("CartAttributes data=", res.data);
      // const dataArr=res.data
      setCount(res?.data?.count);

      const cartAttributeData = makeTableRows(res?.data, storeName);
      setInitiallySortedRows(cartAttributeData);
      setLoadingOrders(false);
      setError({
        code: "",
        message: "",
      });
    } catch (error) {
      // console.log(error);
      setError({
        code: error.status,
        message: error.message,
      });
      setLoadingOrders(false);
      return;
    }
  };

  useEffect(() => {
    const subscription = getCartData();
    // console.log("subscription in useeffect =====>", subscription);
    subscriptionRef.current = subscription;
    return () => {
      if (subscriptionRef.current && subscriptionRef.current.unsubscribe) {
        // console.log("return_in_useEffect");
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [pageNumber, reload]);

  // console.log("pageNumber", pageNumber);
  // console.log("itemsPerPage", itemsPerPage);
  // console.log("Count", Count);
  /***************************************************Selection********************************/
  const handleSelectChange = useCallback((value) => setSelected(value), []);
  const dropDownOptions = [
    { label: "Cart Attributes", value: "cartattrs" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "lastWeek" },
  ];

  /**********************************************Search Bar***************************************** */
  const deselectedOptions = useMemo(() => [], []);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const Debouncing = (callback, time) => {
    //debouncing function to make user to wait atleast 3 sec after user done with typing

    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
      }, time);
    };
  };

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setTimeout(() => {
          //wait for sometime before getting data and show to user
          getCartData();
        }, 3000);

        setOptions(deselectedOptions);

        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      setOptions(resultOptions);

      //using debouncing for search operation only when search query is greater than 3 letter
      // console.log("Value", value.length);
      if (value?.length >= 3) {
        setLoadingOrders(false);
        const SearchDebouncing = Debouncing(getCartData, 2000); //run SearchOrders after 3 seconds when user done with typing
        let searchTerm = value;
        if (searchTerm.includes("#")) {
          searchTerm = searchTerm.split("#")[1];
        }

        SearchDebouncing(searchTerm); //searchquery ,productcount,useState from OrderDataTable
      }
    },
    [deselectedOptions]
  );

  const updateSelection = useCallback(
    (selected) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      setSelectedOptions(selected);
      setInputValue(selectedValue[0]);
    },
    [options]
  );

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Search Cart Attributes"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Search"
      loading={true}
    />
  );

  return (
    <Page
      title={topic}
      fullWidth
      pagination={{
        hasPrevious: pageNumber > 0 ? true : false,
        hasNext: itemsPerPage * (pageNumber + 1) < Count,
        onPrevious: () => {
          setPageNumber((num) => num > 0 && num - 1);
          // console.log("Previous");
        },
        onNext: () => {
          setPageNumber((num) => num + 1);
          // console.log("Next");
        },
        label: `${pageNumber + 1} of ${Math.ceil(Count / itemsPerPage)}`,
      }}
    >
      <Autocomplete
        options={options}
        selected={selectedOptions}
        onSelect={updateSelection}
        textField={textField}
      />
      <br></br>
      <Layout>
        <Layout.Section oneHalf>
          <AlphaCard>
            <VerticalStack alignment="center">
              {loadingOrders ? (
                <Spinner accessibilityLabel="Spinner example" size="large" />
              ) : (
                ""
              )}

              {Error.message ? (
                <ErrorComponent error={Error} refresh={getCartData} />
              ) : (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "Order Id",
                    "Order Name",
                    "Checkout Token",
                    "Created Date",
                    "Updated Date",
                    "Mobile",
                    "Points RedemptionCode",
                    "Coupon RedemptionCode RequestID",
                  ]}
                  rows={rows}
                  truncate={true}
                  hideScrollIndicator={true}
                  sortable={[
                    false,
                    false,
                    false,
                    true,
                    true,
                    false,
                    false,
                    false,
                  ]}
                  defaultSortDirection="descending"
                  initialSortColumnIndex={4}
                  onSort={handleSort}
                  footerContent={`Showing ${rows?.length} of ${Count} results`}
                  hasZebraStripingOnData
                  increasedTableDensity
                  stickyHeader
                />
              )}
            </VerticalStack>
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );

  function sortDate(rows, index, direction) {
    // console.log(rows, index, direction);

    if (index == 5) {
      return sortFulFillment(rows, index, direction);
    } else {
      return [...rows].sort((rowA, rowB) => {
        const dateA = new Date(rowA[index]).getTime();
        const dateB = new Date(rowB[index]).getTime();
        return direction === "descending" ? dateB - dateA : dateA - dateB;
      });
    }
  }

  function makeTableRows(data, storeInfos) {
    const ordersData = data?.map((cart) => {
      return [
        cart.orderId ? cart.orderId : <Tag>null</Tag>,
        cart.orderName ? cart.orderName : <Tag>null</Tag>,
        cart.checkoutToken ? cart.checkoutToken : <Tag>null</Tag>,
        getDateTimestamp(cart.createdAt),
        getDateTimestamp(cart.updatedAt ? cart.updatedAt : ""),
        cart.phone ? cart.phone : <Tag>null</Tag>,
        cart.points ? JSON.parse(cart.points)?.RedemptionCode : <Tag>null</Tag>,
        cart.coupon ? JSON.parse(cart.coupon)?.RequestID : <Tag>null</Tag>,
      ];
    });

    return ordersData;
  }
}

// export default CartAttributeTables;
