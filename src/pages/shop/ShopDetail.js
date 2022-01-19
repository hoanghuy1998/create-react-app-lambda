import React, { useEffect, useState } from "react";
import "../../../node_modules/slick-carousel/slick/slick.css";
import "../../../node_modules/slick-carousel/slick/slick-theme.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import Slider from "react-slick";
import "./cssDetail/slick.css";
import productSolded from "../../services/productSolded";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import productService from "../../services/productService";
import mycartService from "../../services/mycartService";
import { toast } from "react-toastify";
import ActionTypes from "../../stores/action";
import productDescription from "./../../services/productDescriptiom";

const ShopDetail = () => {
  const param = useParams();
  const [number, setNumber] = useState(1);
  const getUser = useSelector((state) => state.auth.dataUser);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const getMyCart = useSelector((state) => state.auth.allmycarts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sale, setSale] = useState(0);
  const [product, setProduct] = useState({});
  const [listExam, setListExam] = useState([]);
  useEffect(() => {
    loadData();
  }, [param.id]);
  const loadData = () => {
    const getProductAsnyc = new Promise((resolve, reject) => {
      productService.getDetail(param.id).then((res) => {
        if (res.data.errorCode === 0) resolve(res.data.data);
        else reject([]);
      });
    });
    getProductAsnyc
      .then((data) => {
        const getProductDescription = new Promise((resolve, reject) => {
          productDescription.getByQuery(data[0].productId).then((res) => {
            if (res.data.errorCode === 0) {
              const des = res.data.data;
              resolve({ data, des });
            } else reject([]);
          });
        });
        return getProductDescription;
      })
      .then(({ data, des }) => {
        console.log(data);
        setProduct({ ...data[0], listImg: des });
        const c = data[0].tag;
        const getExameProductAsnyc = new Promise((resolve, reject) => {
          const type = data[0].type;
          console.log("type", type);
          console.log("c", c);
          let x = type.filter((t) => t === "men");
          if (x.length === 0) x = type.filter((t) => t === "women");
          resolve({ data, c, x });
        });
        return getExameProductAsnyc;
      })
      .then(({ data, c, x }) => {
        productService.getFillProductQuery(x[0], c).then((res) => {
          const x = res.data.data;
          const z = [];
          x.forEach((x) => {
            if (x.productId !== data[0].productId) z.push(x);
          });
          const y = [];
          z.forEach((z, i) => {
            if (i <= 2) y.push(z);
          });
          setListExam(y);
        });
      })
      .catch();
  };
  console.log(product);
  console.log(listExam);
  const handleChaneNumber = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setNumber(e.target.value);
  };

  const addToCart = (data, n, id) => {
    const getitemmycart = getMyCart.find((x) => x.name === n);
    if (isLogin) {
      const newData = {
        id: data.id,
        quantity: number,
        userId: id,
      };
      if (!getitemmycart) {
        mycartService.add(newData).then((res) => {
          if (res.data.errorCode === 0) {
            toast.success(`đã thêm ${n} vào giỏ hàng với ${number} sản phẩm `);
            mycartService.getListId(getUser.userId).then((res) => {
              dispatch({
                type: ActionTypes.LOAD_MY_CARTS,
                allmycarts: res.data.data,
              });
            });
          } else toast.warning(res.data.errorMessage);
        });
        mycartService.getListId(getUser.userId).then((res) => {
          dispatch({
            type: ActionTypes.LOAD_MY_CARTS,
            allmycarts: res.data.data,
          });
        });
      } else {
        // quantity=1
        const data = {
          quantity: parseInt(getitemmycart.quantity) + parseInt(number),
        };
        console.log(data.quantity);
        mycartService.update(getitemmycart.id, data).then((res) => {
          console.log(res.data);
          if (res.data.errorCode === 0)
            toast.info(`đã tăng ${n} thêm ${number} sản phẩm `);
          else toast.warning(res.data.errorMessage);
        });
      }
    } else {
      dispatch({
        type: ActionTypes.CURRENT_LOACION,
        currentLocation: window.location.pathname,
      });
      navigate("/login");
    }
  };

  const settings = {
    customPaging: function (i) {
      return (
        <a href="/#">
          <img src={product?.listImg[i]?.srcImg} alt="" />
        </a>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: false,
  };
  const handleChangeProduct = (id) => {
    navigate(`/shopdetail/${id}`);
  };
  return (
    <Container className="mb-5">
      <Row className="g-0">
        <Col xs="auto">
          <a
            href="/"
            className=" text-decoration-none fs-4 text-capitalize text-danger d-inline nav-link "
          >
            home
          </a>
          <i className="fa fa-angle-right fw-border" aria-hidden="true"></i>
        </Col>
        <Col xs="auto">
          <a
            href="/"
            className=" text-decoration-none fs-4 text-capitalize text-primary d-inline nav-link "
          >
            shop
          </a>
          <i className="fa fa-angle-right fw-border" aria-hidden="true"></i>
        </Col>
        <Col className=" mt-2">
          <span className="text-capitalize fs-5 mx-2 text-secondary">
            {product.name}
          </span>
        </Col>
      </Row>
      <Row className="g-4 mb-4">
        <Col sm={12} md={6} className="mt-5">
          <Slider {...settings} class="w-100 p-2">
            {product?.listImg?.map((img, index) => (
              <div key={index} data-thumb={img} class="w-100">
                <img className="w-100" src={img.srcImg} alt="" />
                <a href={img.srcImg}></a>
              </div>
            ))}
          </Slider>
        </Col>
        <Col className="mt-5">
          <Row>
            <h4 className="text-capitalize fs-4 text-danger">
              {product?.name}
            </h4>
          </Row>
          <Row className="mt-2">
            <Col xs="auto"> {product?.price}.000 vnđ </Col>
            <Col xs="auto">
              <del className="text-warning">
                {product?.price + sale}.000 vnđ
              </del>
              <sup className="mx-1 text-danger">
                {Math.ceil((sale / (product?.price + sale)) * 100)}%
              </sup>
            </Col>
          </Row>
          <Row>
            <p className="text-capitalize fs-4 text-primary mt-2 mb-2 ">
              mô tả
            </p>
            <p> {product?.description} </p>
          </Row>
          <Row className="mt-3 mb-3">
            <Col>
              <input
                style={{ width: "100px" }}
                className="form-control m-auto "
                type="number"
                onChange={handleChaneNumber}
                name="num-product"
                defaultValue="1"
              />
            </Col>
            <Col>
              <Button
                className="btn btn-primary rounded-pill w-50 m-auto text-capitalize fw-border  "
                onClick={() => addToCart(product, product.name, getUser.userId)}
              >
                Add to cart
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col xs="auto">
              <a href="/#">
                <i className="fa fa-facebook text-info nav-link  fs-2"></i>
              </a>
            </Col>
            <Col xs="auto">
              <a href="/#">
                <i className="fa fa-twitter text-primary nav-link   fs-2"></i>
              </a>
            </Col>
            <Col xs="auto">
              <a href="/#">
                <i className="fa fa-google-plus text-success  nav-link fs-2"></i>
              </a>
            </Col>
          </Row>
          <Row>
            <p className="text-capitalize text-primary fs-4 mt-2 mb-2">
              sản phẩm tương tự
            </p>
            {listExam.map((img, idx) => (
              <Col key={idx}>
                <img
                  onClick={() => handleChangeProduct(img.id)}
                  src={img.srcImg}
                  className="w-100"
                  alt=""
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ShopDetail;
