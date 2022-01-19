import React, { useEffect, useState, useRef } from "react";
import "./Features.css";
import { Container, Row, Col,Button } from "react-bootstrap";
import mycartService from "../../services/mycartService";
import ConfirmDialog from "../../component/ConfirmDialog";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import ActionTypes from "../../stores/action";

import productSolded from "../../services/productSolded";

import { DebounceInput } from "react-debounce-input";
import loginService from "../../services/loginService";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const fee = 12;
  const coupon = "abc123";
  const [carts, setCarts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [transport, setTransport] = useState(0);
  const [sale, setSale] = useState(0);
  const [applyCoupon, setApplyCoupon] = useState("");
  const [allTotal, setAllTotal] = useState(0);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [user, setUser] = useState({});
  const getUser = useSelector((state) => state.auth.dataUser);
  const getCarts = useSelector((state) => state.auth.allmycarts);
  const [checkouts, setCheckouts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const couponRef = useRef();
  const [tp, setTp] = useState({
    dress: "",
    city: "",
    district: "",
    ward: "",
  });
  const [data, setData] = useState({
    transportFee: 0,
    userId: getUser?.userId,
    userName: getUser?.userName,
    details: [],
    phone: getUser?.phone,
    dress: getUser?.dress,
    ward: getUser?.ward,
    city: getUser?.city,
    district: getUser?.district,
    coupon:0
  });
  const [confirmOptions, setConfirmOptions] = useState({
    show: false,
    content: "",
    dataId: 0,
  });
  function format2(n, currency) {
    return n.toFixed(3).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") + " " + currency;
  }
  const handleDetails = (e, id) => {
    e.preventDefault();
    navigate(`/shopdetail/${id}`);
  };
  const getMyCart = (data) => {
    dispatch({
      type: ActionTypes.LOAD_MY_CARTS,
      allmycarts: data,
    });
  };
  const loadData = () => {
    mycartService.getListId(getUser.userId).then((res) => {
      setCarts(res.data.data);
      getMyCart(res.data.data);
    });
    loginService.getUser(getUser.id).then((res) => setUser(res.data.data[0]));
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((result) => {
        setCities(result);
      });
  };
  const handleChangeData = (e, id, quantity,name) => {
    if (parseInt(e.target.value) === 0) {
      mycartService.delete(id).then((res) => {
        if (res.data.errorCode === 0) {
          toast.success(`đã xóa thành công ${name} ra khỏi giỏ hàng`);
          loadData();
          // Total();
        } else {
          toast.warning("update fail");
        }
      });
    } else {
      let data = { quantity: parseInt(e.target.value) };
      mycartService.update(id, data).then((res) => {

        toast.info(`đã cập nhật lại số lượng  ${res.data.data.name} thành công `);
        loadData();
      });
      loadData();
    }
  };
  const ChangeTp = (e) => {
    const newData = { ...data };
    newData[e.target.name] = e.target.value;
    setData(newData);
  };
  const handleDelete = (e, id) => {
    e.preventDefault();
    const selecteCartItem = carts.find((x) => x.id === id);
    if (selecteCartItem) {
      setConfirmOptions({
        show: true,
        content: `Are you sure you want to delete "${selecteCartItem.name}" ? `,
        dataId: id,
      });
    }
  };
  const handleConfirm = (id) => {
    setConfirmOptions({ show: false });
    if (id) {
      mycartService.delete(id).then((res) => {
        loadData();
        toast.warning("Xóa Sản Phẩm Thành Công");
      });
    }
  };
  const handleChangeCity = (e) => {
    // e.preventDefault();
    const newData = { ...data };
    newData[e.target.name] = e.target.value;
    setData(newData);
    const dis = cities.find((x) => x.name === e.target.value);
    setDistricts(dis?.districts);
  };
  const handleChangeDistrict = (e) => {
    // e.preventDefault();
    const dis = districts.find((x) => x.code === parseInt(e.target.value));

    const newData = { ...data };
    newData[e.target.name] = dis.name;
    setData(newData);
    fetch("https://provinces.open-api.vn/api/w")
      .then((res) => res.json())
      .then((result) => {
        wards.length = 0;
        for (var i = 0; i <= result.length - 1; i++) {
          if (parseInt(result[i].district_code) === parseInt(e.target.value))
            wards.push(result[i]);
        }
        loadData();
      });
  };
  const handleCheckout = (e) => {
    e.preventDefault();
    const newData = { ...data };
    getCarts.forEach((x) => newData.details.push(x.id));
    setData(newData); 
  };
  const handleCheckProduct = (item, e) => {
    if (e.target.checked) {
      setCheckouts((checkouts) => [...checkouts, item]);
    } else {
      const x = [...checkouts];
      x.forEach((c, i) => {
        if (c.id === item.id) x.splice(i, 1);
      });
      setCheckouts(x);
    }
  };
  useEffect(() => {
    setCartTotal(0);
    checkouts.forEach((c) => {
      setCartTotal((cartTotal) => (cartTotal += c.total));
    });
  }, [checkouts]);
  
 
  const handleApplyCoupon = (e) => {
    if (applyCoupon === coupon) {
      setData({ ...data, coupon: 15 });
      toast.success(`đã áp dụng đơn giảm giá ${format2(15, "vnđ")}`);
    }else{
      setData({ ...data, coupon: 0 });
      toast.warning('mã giảm giá không hợp lệ');
      setApplyCoupon('')
    }
  };
  useEffect(() => { 
    if (checkouts.length <= 3) {
    setData(data=>({ ...data, transportFee:fee*checkouts.length }));
  } else if (checkouts.length > 3 && checkouts.length <= 6) {

    setData({ ...data, transportFee: parseInt(fee) });
  } else {
    setData({ ...data, transportFee: 0 });
  }},[checkouts])
  useEffect(() => {
    setData({ ...data, details: checkouts.map((c) => c.id) })
    setAllTotal(
      (allTotal) => (allTotal =cartTotal + data.transportFee -data.coupon)
    );
  }, [sale, cartTotal, transport,data.coupon]);
  const handlePay=e=>{
    e.preventDefault();

    productSolded.add(data).then((res) => {
      if (res.data.errorCode === 0) {
        dispatch({
          type: ActionTypes.DATA_USER_CHECK_OUT,
          dataUserCheckOut: res.data.data,
        });
        toast.success(
          `Bạn đã đặt hàng thành công với mã đơn hàng "${res.data.data.codeOrder}"`
        );
        loadData();
        navigate("/order");
      }
    });
  }
  return (
    <>
      <Container>
        <div className="bread-crumb flex-w p-l-25 p-r-15 p-t-30 p-lr-0-lg">
          <a href="index.html" className="text-link trans-04">
            Trang Chủ
            <i
              className="fa fa-angle-right m-l-9 m-r-10"
              aria-hidden="true"
            ></i>
          </a>

          <span className="text-link text-color">Thanh Toán</span>
        </div>
      </Container>

      <form className="bg0 p-t-75 p-b-85">
        <Container>
          <Row>
            {getCarts.length === 0 ? (
              <span className="d-flex justify-content-center fw-bold span-nothing text-warning">
                KHÔNG CÓ SẢN PHẨM TRONG GIỞ HÀNG VUI LÒNG CHỌN SẢN PHẨM
              </span>
            ) : (
              <>
                <div className="col-lg-10 col-xl-7 m-lr-auto m-b-50">
                  <div className="m-l-25 m-r--38 m-lr-0-xl">
                    <div className="wrap-table-shopping-cart">
                      <table className="table-shopping-cart">
                        <thead>
                          <tr className="table_head">
                            <th className="text-center"></th>
                            <th className="column-1">Sản Phẩm</th>
                            <th className="column-2"></th>
                            <th className="column-3">Giá</th>
                            <th className="column-4">Số Lượng</th>
                            <th className="column-5">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCarts.map((item, index) => (
                            <tr
                              className="table_row justify-content-center"
                              key={index}
                            >
                              <td className="">
                                <input
                                  type="checkbox"
                                  onChange={(e) => handleCheckProduct(item, e)}
                                  className="m-auto align-center fs-2 "
                                  style={{ width: "2rem", height: "2rem" }}
                                />
                              </td>
                              <td className="column-1">
                                <div className="how-itemcart1">
                                  <img
                                    src={item.srcImg}
                                    name="srcImg"
                                    alt="IMG"
                                  />
                                  <i
                                    className="fa fa-times itemcart-icon"
                                    aria-hidden="true"
                                    onClick={(e, id) =>
                                      handleDelete(e, item.id)
                                    }
                                  ></i>
                                </div>
                              </td>
                              <td className="column-2" name="name">
                                <a
                                  href="/#"
                                  className="link-detail"
                                  onClick={(e) =>
                                    handleDetails(e, item.productId)
                                  }
                                >
                                  {item.name}
                                </a>
                              </td>
                              <td className="column-3" name="price">
                                {format2(item.price, "vnđ")}
                              </td>
                              <td className="column-4">
                                <div className="wrap-input">
                                  <DebounceInput
                                    minLength={1}
                                    debounceTimeout={500}
                                    maxLength={3}
                                    id="txtquantity"
                                    className="form-control mtext-104 cl3 txt-center"
                                    type="number"
                                    name="quantity"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleChangeData(
                                        e,
                                        item.id,
                                        item.quantity,
                                        item.name
                                      )
                                    }
                                  />
                                </div>
                              </td>
                              <td className="column-5 align-center px-2">
                                {format2(item.total, "vnđ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex-w flex-sb-m bor15 p-t-18 p-b-15 p-lr-40 p-lr-15-sm">
                      <div className="flex-w flex-m m-r-20 m-tb-5">
                        <input
                          className=" input-coupon  p-lr-20 m-r-10 m-tb-5"
                          ref={couponRef}
                          type="text"
                          name="coupon"
                          defaultValue={applyCoupon}
                          placeholder="Coupon Code"
                          onChange={(e) => setApplyCoupon(e.target.value)}
                        />

                        <div
                          onClick={handleApplyCoupon}
                          className="flex-c-m  hov-btn3 p-lr-15 trans-04 pointer m-tb-5 btn-Apply"
                        >
                          Apply coupon
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-10 col-lg-7 col-xl-5 m-lr-auto m-b-50">
                  {/* <div className="bor10 p-lr-40 p-t-30 p-b-40 m-l-63 m-r-40 m-lr-0-xl p-lr-15-sm">
                    <h4 className="mtext-109 cl2 p-b-30">Tổng Giỏ Hàng</h4> */}

                  {/* <div className="flex-w flex-t bor12 p-b-13">
                      <div className="size-208">
                        <span className="stext-110 cl2">Subtotal:</span>
                      </div>

                      <div className="size-209">
                        <span className="mtext-110 cl2">$ {cartTotal}</span>
                      </div>
                    </div> */}

                  {/* <div className="flex-w flex-t bor12 p-t-15 p-b-30">
                      <div className="size-208 w-full-ssm">
                        <span className="stext-110 cl2">Vận Chuyển:</span>
                        <div className="infomation">
                          <div className="stext-110 cl2 phone-numer">
                            Số Điện Thoại:
                          </div>
                          <div className="stext-110 cl2 info">Địa Chỉ:</div>
                          <div className="stext-110 cl2 info">
                            Tỉnh/Thành Phố:
                          </div>
                          <div className="stext-110 cl2 info">Quận/Huyện:</div>
                          <div className="stext-110 cl2 info">Phường/Xã:</div>
                        </div>
                      </div>

                      <div className="size-209 p-r-18 p-r-0-sm w-full-ssm">
                        <p className="stext-111 cl6 p-t-2">
                          Phương thức vận chuyển sẽ được chúng tôi lựa chọn phù
                          hợp với địa chỉ giao hàng của bạn
                        </p>

                        <div className="p-t-15">
                          <span className="stext-112 cl8">
                            Tính Toán Vận Chuyển
                          </span>
                          <div className="bor8 bg0 m-b-12">
                            <input
                              className="stext-111 cl8 plh3 size-111 p-lr-15"
                              type="text"
                              name="phone"
                              placeholder="phone"
                              onChange={ChangeTp}
                              defaultValue={user?.phone}
                            />
                          </div>
                          <div className="bor8 bg0 m-b-12">
                            <input
                              className="stext-111 cl8 plh3 size-111 p-lr-15"
                              type="text"
                              name="dress"
                              placeholder="Adress"
                              onChange={ChangeTp}
                              defaultValue={user?.dress}
                            />
                          </div>

                          <div className="rs1-select2 rs2-select2 bor8 bg0 m-b-12 m-t-9">
                            <select
                              name="city"
                              className="form-select"
                              onChange={handleChangeCity}
                              aria-label="Default select example"
                            >
                              {cities.map((c, index) => (
                                <option key={index} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="dropDownSelect2"></div>
                          </div>
                          <div className="rs1-select2 rs2-select2 bor8 bg0 m-b-12 m-t-9">
                            <select
                              name="district"
                              className="form-select"
                              onChange={handleChangeDistrict}
                              aria-label="Default select example"
                            >
                              {districts.map((c, index) => (
                                <option key={index} value={c?.code}>
                                  {c?.name}
                                </option>
                              ))}
                            </select>
                            <div className="dropDownSelect2"></div>
                          </div>
                          <div className="rs1-select2 rs2-select2 bor8 bg0 m-b-12 m-t-9">
                            <select
                              name="ward"
                              className="form-select"
                              aria-label="Default select example"
                              onChange={ChangeTp}
                              defaultValue={user?.ward}
                            >
                              {wards.map((c, index) => (
                                <option key={index} value={c?.name}>
                                  {c?.name}
                                </option>
                              ))}
                            </select>
                            <div className="dropDownSelect2"></div>
                          </div>
                        </div>
                      </div>
                    </div> */}

                  {/* <div className="flex-w flex-t p-t-27 p-b-33">
                      <div className="size-208">
                        <span className="mtext-101 cl2">Tổng Cộng:</span>
                      </div>

                      <div className="size-209 p-t-1">
                        <span className="mtext-110 cl2">{cartTotal}.000đ</span>
                      </div>
                    </div> */}

                  {/* <button
                      className="flex-c-m stext-101 cl0 size-116 bg3 bor14 hov-btn3 p-lr-15 trans-04 pointer"
                      onClick={handleCheckout}
                    >
                      Đặt Hàng
                    </button> */}
                  {/* <button
                      className="flex-c-m stext-101 cl0 size-116 bg3 bor14 hov-btn3 p-lr-15 trans-04 pointer"
                      onClick={handleTest}
                    >
                      Test
                    </button> */}
                  {/* </div> */}
                </div>
              </>
            )}
          </Row>
        </Container>
      </form>
      <Container>
        <Row>
          <Col>
            <i
              className="fa fa-map-marker text-success fs-3"
              aria-hidden="true"
            ></i>
            <span className="text-capitalize mx-1">{getUser?.dress},</span>
            <span className="text-capitalize mx-1">{getUser?.ward},</span>
            <span className="text-capitalize mx-1">{getUser?.district},</span>
            <span className="text-capitalize mx-1">{getUser?.city}</span>
          </Col>
          <Col xs="auto">
            <i className="fa fa-angle-right me-4" aria-hidden="true"></i>
          </Col>
        </Row>
      </Container>
      <Row className="justify-content-center">
        <Col xs="6">
          <Row className="mt-4 mb-4 justify-content-center">
            <Col>
              <h2 className="text-capitalize text-primary fs-4">thanh toán </h2>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="text-capitalize text-info fs-5">tạm tính :</Col>
            <Col>{format2(cartTotal, "vnđ")}</Col>
          </Row>
          <Row className="mt-2">
            <Col className="text-capitalize text-info fs-5">
              phí vận chuyển :
            </Col>
            <Col>{format2(data?.transportFee, "vnđ")} </Col>
          </Row>
          <Row className="mt-2">
            <Col className="text-capitalize text-info fs-5">giảm giá :</Col>
            <Col> {format2(-data.coupon, "vnđ")} </Col>
          </Row>
          <Row className="mt-2">
            <Col className="text-capitalize text-info fs-5">tổng cộng :</Col>
            <Col>{format2(allTotal, "vnđ")}</Col>
          </Row>
        </Col>
       
      </Row>
      <Row className=" mt-4 mb-4 justify-content-center">
      <Col xs="auto">
          <Button variant="primary" className="text-center text-uppercase btn btn-primary" onClick={handlePay}>thanh toán
          </Button>
        </Col>
      </Row>
      <ConfirmDialog options={confirmOptions} onConfirm={handleConfirm} />
    </>
  );
};

export default Features;
