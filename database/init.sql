USE DiningManagementSystem
GO

-- 供应商表
CREATE TABLE Supplier
(
    SupplierID    VARCHAR(20) PRIMARY KEY,
    SupplierName  VARCHAR(50) NOT NULL,
    Address       VARCHAR(100),
    ContactNumber CHAR(11)    NOT NULL
);

-- 食材表
CREATE TABLE Ingredient
(
    IngredientID   VARCHAR(20) PRIMARY KEY,
    IngredientName VARCHAR(50) NOT NULL,
    Unit           VARCHAR(10) NOT NULL,
    Stock          INT         NOT NULL DEFAULT 0,
    Threshold      INT         NOT NULL DEFAULT 0,
    SupplierID     VARCHAR(20) NOT NULL,
    FOREIGN KEY (SupplierID) REFERENCES Supplier (SupplierID)
);

-- 菜品表
CREATE TABLE Dish
(
    DishID            VARCHAR(20) PRIMARY KEY,
    DishName          VARCHAR(50)    NOT NULL,
    Price             DECIMAL(10, 2) NOT NULL,
    DishStock         INT            NOT NULL DEFAULT 0,
    SeasonalAttribute VARCHAR(10) CHECK ( SeasonalAttribute in ('spring', 'summer', 'autumn', 'winter', 'none') )
);

-- 制作表
CREATE TABLE Production
(
    IngredientID         VARCHAR(20) NOT NULL,
    DishID               VARCHAR(20) NOT NULL,
    QuantityOfIngredient INT         NOT NULL,
    PRIMARY KEY (IngredientID, DishID),
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID),
    FOREIGN KEY (DishID) REFERENCES Dish (DishID)
);

-- 窗口表
CREATE TABLE Window
(
    WindowID   VARCHAR(20) PRIMARY KEY,
    WindowName VARCHAR(50) NOT NULL,
    Manager    VARCHAR(50) NOT NULL
);

-- 出售表
CREATE TABLE Sale
(
    WindowID VARCHAR(20) NOT NULL,
    DishID   VARCHAR(20) NOT NULL,
    PRIMARY KEY (WindowID, DishID),
    FOREIGN KEY (WindowID) REFERENCES Window (WindowID),
    FOREIGN KEY (DishID) REFERENCES Dish (DishID)
);

-- 学生卡表
CREATE TABLE StudentCard
(
    CardID  VARCHAR(20) PRIMARY KEY,
    Balance DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- 学生表
CREATE TABLE Student
(
    StudentID VARCHAR(20) PRIMARY KEY,
    Name      VARCHAR(10) NOT NULL,
    CardID    VARCHAR(20) UNIQUE,
    FOREIGN KEY (CardID) REFERENCES StudentCard (CardID)
);

-- 订单表
CREATE TABLE OrderDetail
(
    OrderID     VARCHAR(20) PRIMARY KEY,
    OrderType   VARCHAR(10)    NOT NULL CHECK ( OrderType in ('dining', 'takeout') ),
    OrderTime   DATETIME       NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    CardID      VARCHAR(20)    NOT NULL,
    WindowID    VARCHAR(20)    NOT NULL,
    FOREIGN KEY (CardID) REFERENCES StudentCard (CardID),
    FOREIGN KEY (WindowID) REFERENCES Window (WindowID)
);

-- 包含表
CREATE TABLE OrderItem
(
    DishID         VARCHAR(20) NOT NULL,
    OrderID        VARCHAR(20) NOT NULL,
    QuantityOfDish INT         NOT NULL CHECK ( QuantityOfDish > 0 ),
    PRIMARY KEY (DishID, OrderID),
    FOREIGN KEY (DishID) REFERENCES Dish (DishID),
    FOREIGN KEY (OrderID) REFERENCES OrderDetail (OrderID)
);

-- 密码表，用于存储每个学生的密码
CREATE TABLE Password
(
    StudentID       VARCHAR(20),
    AccountPassword VARBINARY(60) NOT NULL,
    PRIMARY KEY (StudentID),
    FOREIGN KEY (StudentID) REFERENCES Student (StudentID)
);