import React from "react";
import "font-awesome/css/font-awesome.css";
import { Card, Row, Button ,Col} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ActionTypes from "../stores/action";
import mycartService from "../services/mycartService";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import loginService from "./../services/loginService";

function ListProductItem({ productItem, status, home, shop }) {
  const getUser = useSelector((state) => state.auth.dataUser);
  const isLogin = useSelector((state) => state.auth.isLogin);
  const getMyCart = useSelector((state) => state.auth.allmycarts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const addToCart = (data, n, id) => {
    const getitemmycart = getMyCart.find((x) => x.name === n);
    if (isLogin) {
      const newData = {
        id: data.id,
        quantity: 1,
        userId: id,
      };
      if (!getitemmycart) {
        mycartService.add(newData).then((res) => {
          if (res.data.errorCode === 0) {
            toast.success(`đã thêm ${n} vào giỏ hàng `);
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
        const data = { quantity: parseInt(getitemmycart.quantity) + 1 };
        console.log(data.quantity);
        mycartService.update(getitemmycart.id, data).then((res) => {
          console.log(res.data);
          if (res.data.errorCode === 0)
            toast.info(`đã tăng ${n} thêm 1 sản phẩm `);
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
  const handleChangStatus = (p, id, n) => {
    const x = p.listProductLike.find((l) => l === id);
    if (x === "undefined") {
    } else {
    }
    if (x) {
      p.listProductLike.splice(p.listProductLike.indexOf(x), 1);
      toast.info(`đã xóa ${n} ra khỏi  danh sách yêu thích `);
    } else {
      p.listProductLike.push(id);
      toast.success(`đã thêm ${n} vào  danh sách yêu thích `);
    }
    console.log("p.email", p.email);
    const q = { listProductLike: p.listProductLike };
    loginService.putdata(q, p.id).then((res) => {
      console.log(res.data);
      dispatch({
        type: ActionTypes.LOGIN,
        dataUser: res.data.data,
      });
    });
  };
  const handleDetails = (e, id) => {
    navigate(`/shopdetail/${id}`);
  };
  console.log(productItem?.status);
  return (
    <Card className="overflow-hidden card__product--item">
      <div className="overflow-hidden">
        <Card.Img
          variant="top"
          className="card__product--item-img"
          src={productItem?.srcImg}
          style={{ height: "300px" }}
        />

        {shop ? (
          productItem?.status.find((s) => s === "new") ? (
            <img
              className="position-absolute "
              style={{
                width: "4rem",
                height: "4rem",
                top: "0px",
                right: "-5px",
              }}
              alt=""
              src="https://github.com/projectReact21/coza_store/blob/main/src/resoures/icons/new scale.png?raw=true"
            />
          ) : (
            ""
          )
        ) : (
          ""
        )}
      </div>
      <Card.Body>
        <Card.Text className="position-absolute top-1 right-0 me-2">
          {status ? (
            ""
          ) : (
            <i
              onClick={() =>
                handleChangStatus(getUser, productItem.id, productItem.name)
              }
              className="fa fa-heart fs-4 card__product--item-status"
              style={
                isLogin
                  ? getUser?.listProductLike?.find((l) => l === productItem.id)
                    ? { color: "red" }
                    : { color: "#eee" }
                  : { color: "#eee" }
              }
            ></i>
          )}
        </Card.Text>
        <Card.Title className="text-overflow-1 pe-4">
          {productItem?.name}
        </Card.Title>
        <Card.Text
          style={{ fontSize: "1rem" }}
        >{`${productItem?.price}.000đ`}</Card.Text>
        <Row
          className={
            home ? "justify-content-center" : "justify-content-between  g-4 gx-5 "
          }
        >
          {home ? (
            ""
          ) : (
            <Button
              variant="primary"
                className=" btn  card__product--item-btn  mx-0 col-xs-12 col-md-6  "
              onClick={(e) => handleDetails(e, productItem.id)}
            >
              Thông tin
            </Button>
          )}
          <Button
     
            variant="primary"
            className={
              home
                ? "card__product--item-btn mx-2 col-xs-12 col-md-6 "
                : " card__product--item-btn me-0 col-xs-12 col-md-6 btn btn-primary"
            }
            onClick={() =>
              addToCart(
                productItem ? productItem : [],
                productItem.name,
                getUser.userId
              )
            }
          >
            Mua
          </Button>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default ListProductItem;
