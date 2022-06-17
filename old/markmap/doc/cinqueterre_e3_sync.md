# 五渔村商城与E3同步

## 接口准备

### 接口地址

- 正式环境：http://[URL][:PORT]/webopm/web/?app_act=api/ec&app_mode=func
- 测试环境：http://[URL][:PORT]/webopm/web/?app_act=api/ec&app_mode=func

### 请求

- 参数

	- key

		- 账号

	- requestTime

		- 请求时间（YmdHis）

	- sign

		- 签名，MD5加密

			- key

				- 账号

			- requestTime

				- 请求时间（YmdHis）

			- secret

				- 密钥

			- version

				- 3.0

			- serviceType

				- 业务类型（接口名称）

			- data

				- 业务数据（json）

	- serviceType

		- 业务类型（接口名称）

	- data

		- 业务数据（json）

	- version

		- 3.0

### 账号

- 测试账号

	- key

		- test

	- secret

		- 1a2b3c4d5e6f7g8h9i10j11k12l

- 正式账号

## 订单同步

### 接口

- 新增订单 order.detail.add
- 查询订单 order.detail.get
- 作废订单 order.zwx
- 挂起订单 order.handup
- 订单取消发货 order.cancel.delivery
- 新增退单 order.return.add
- 查询退单 return.detail.get
- 退单快速入库 order.return.ksrk
- 释放订单库存 OrderAdaptUnlock

### 调用场景

- 用户下单

	- E3新增订单

		- 商品或库存正确
		- 商品或库存不匹配

			- E3挂起订单

- 查询订单

	- E3查询订单

		- 显示商品发货状态和物流

- 取消或退货

	- E3查询订单

		- 订单未发货

			- E3订单取消发货
			- E3释放订单库存
			- E3作废订单

		- 订单已发货

			- E3挂起订单
			- E3新增退单
