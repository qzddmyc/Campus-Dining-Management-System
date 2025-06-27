USE DiningManagementSystem
GO

-- 1. Supplier表删除触发器：防止删除有引用的供应商
CREATE TRIGGER trg_Supplier_Delete
ON Supplier
INSTEAD OF DELETE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Ingredient i JOIN deleted d ON i.SupplierID = d.SupplierID)
    BEGIN
        RAISERROR('无法删除该供应商，已有食材关联！', 16, 1)
        ROLLBACK TRANSACTION
    END
    ELSE
    BEGIN
        DELETE Supplier FROM Supplier s JOIN deleted d ON s.SupplierID = d.SupplierID
    END
END
GO

-- 2. Supplier表修改触发器：防止修改有引用的供应商ID
CREATE TRIGGER trg_Supplier_Update
ON Supplier
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(SupplierID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Ingredient i JOIN deleted d ON i.SupplierID = d.SupplierID)
        BEGIN
            RAISERROR('无法修改该供应商ID，已有食材关联！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE Supplier
            SET SupplierID = i.SupplierID,
                SupplierName = i.SupplierName,
                Address = i.Address,
                ContactNumber = i.ContactNumber
            FROM Supplier s
            JOIN inserted i ON s.SupplierID = i.SupplierID
        END
    END
    ELSE
    BEGIN
        UPDATE Supplier
        SET SupplierName = i.SupplierName,
            Address = i.Address,
            ContactNumber = i.ContactNumber
        FROM Supplier s
        JOIN inserted i ON s.SupplierID = i.SupplierID
    END
END
GO

-- 3. Ingredient表删除触发器：级联删除Production表中的记录
CREATE TRIGGER trg_Ingredient_Delete
ON Ingredient
AFTER DELETE
AS
BEGIN
    DELETE p
    FROM Production p
    JOIN deleted d ON p.IngredientID = d.IngredientID
END
GO

-- 4. Ingredient表修改触发器：防止修改有引用的食材ID
CREATE TRIGGER trg_Ingredient_Update
ON Ingredient
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(IngredientID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Production p JOIN deleted d ON p.IngredientID = d.IngredientID)
        BEGIN
            RAISERROR('无法修改该食材ID，已有菜品关联！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE Ingredient
            SET IngredientID = i.IngredientID,
                IngredientName = i.IngredientName,
                Unit = i.Unit,
                Stock = i.Stock,
                Threshold = i.Threshold,
                SupplierID = i.SupplierID
            FROM Ingredient ing
            JOIN inserted i ON ing.IngredientID = i.IngredientID
        END
    END
    ELSE
    BEGIN
        UPDATE Ingredient
        SET IngredientName = i.IngredientName,
            Unit = i.Unit,
            Stock = i.Stock,
            Threshold = i.Threshold,
            SupplierID = i.SupplierID
        FROM Ingredient ing
        JOIN inserted i ON ing.IngredientID = i.IngredientID
    END
END
GO

-- 5. Dish表删除触发器：级联删除Production、Sale和OrderItem表中的记录
CREATE TRIGGER trg_Dish_Delete
ON Dish
AFTER DELETE
AS
BEGIN
    DELETE p
    FROM Production p
    JOIN deleted d ON p.DishID = d.DishID

    DELETE s
    FROM Sale s
    JOIN deleted d ON s.DishID = d.DishID

    DELETE oi
    FROM OrderItem oi
    JOIN deleted d ON oi.DishID = d.DishID
END
GO

-- 6. Dish表修改触发器：防止修改有引用的菜品ID
CREATE TRIGGER trg_Dish_Update
ON Dish
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(DishID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Production p JOIN deleted d ON p.DishID = d.DishID)
            OR EXISTS (SELECT 1 FROM Sale s JOIN deleted d ON s.DishID = d.DishID)
            OR EXISTS (SELECT 1 FROM OrderItem oi JOIN deleted d ON oi.DishID = d.DishID)
        BEGIN
            RAISERROR('无法修改该菜品ID，已有关联记录！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE Dish
            SET DishID = i.DishID,
                DishName = i.DishName,
                Price = i.Price,
                DishStock = i.DishStock,
                SeasonalAttribute = i.SeasonalAttribute
            FROM Dish d
            JOIN inserted i ON d.DishID = i.DishID
        END
    END
    ELSE
    BEGIN
        UPDATE Dish
        SET DishName = i.DishName,
            Price = i.Price,
            DishStock = i.DishStock,
            SeasonalAttribute = i.SeasonalAttribute
        FROM Dish d
        JOIN inserted i ON d.DishID = i.DishID
    END
END
GO

-- 7. Window表删除触发器：防止删除有引用的窗口
CREATE TRIGGER trg_Window_Delete
ON Window
INSTEAD OF DELETE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Sale s JOIN deleted d ON s.WindowID = d.WindowID)
        OR EXISTS (SELECT 1 FROM OrderDetail od JOIN deleted d ON od.WindowID = d.WindowID)
    BEGIN
        RAISERROR('无法删除该窗口，已有关联记录！', 16, 1)
        ROLLBACK TRANSACTION
    END
    ELSE
    BEGIN
        DELETE Window FROM Window w JOIN deleted d ON w.WindowID = d.WindowID
    END
END
GO

-- 8. Window表修改触发器：防止修改有引用的窗口ID
CREATE TRIGGER trg_Window_Update
ON Window
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(WindowID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Sale s JOIN deleted d ON s.WindowID = d.WindowID)
            OR EXISTS (SELECT 1 FROM OrderDetail od JOIN deleted d ON od.WindowID = d.WindowID)
        BEGIN
            RAISERROR('无法修改该窗口ID，已有关联记录！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE Window
            SET WindowID = i.WindowID,
                WindowName = i.WindowName,
                Manager = i.Manager
            FROM Window w
            JOIN inserted i ON w.WindowID = i.WindowID
        END
    END
    ELSE
    BEGIN
        UPDATE Window
        SET WindowName = i.WindowName,
            Manager = i.Manager
        FROM Window w
        JOIN inserted i ON w.WindowID = i.WindowID
    END
END
GO

-- 9. StudentCard表删除触发器：防止删除有引用的学生卡
CREATE TRIGGER trg_StudentCard_Delete
ON StudentCard
INSTEAD OF DELETE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Student s JOIN deleted d ON s.CardID = d.CardID)
        OR EXISTS (SELECT 1 FROM OrderDetail od JOIN deleted d ON od.CardID = d.CardID)
    BEGIN
        RAISERROR('无法删除该学生卡，已有关联记录！', 16, 1)
        ROLLBACK TRANSACTION
    END
    ELSE
    BEGIN
        DELETE StudentCard FROM StudentCard sc JOIN deleted d ON sc.CardID = d.CardID
    END
END
GO

-- 10. StudentCard表修改触发器：防止修改有引用的学生卡ID
CREATE TRIGGER trg_StudentCard_Update
ON StudentCard
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(CardID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Student s JOIN deleted d ON s.CardID = d.CardID)
            OR EXISTS (SELECT 1 FROM OrderDetail od JOIN deleted d ON od.CardID = d.CardID)
        BEGIN
            RAISERROR('无法修改该学生卡ID，已有关联记录！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE StudentCard
            SET CardID = i.CardID,
                Balance = i.Balance
            FROM StudentCard sc
            JOIN inserted i ON sc.CardID = i.CardID
        END
    END
    ELSE
    BEGIN
        UPDATE StudentCard
        SET Balance = i.Balance
        FROM StudentCard sc
        JOIN inserted i ON sc.CardID = i.CardID
    END
END
GO

-- 11. Student表删除触发器：级联删除Password表中的记录
CREATE TRIGGER trg_Student_Delete
ON Student
AFTER DELETE
AS
BEGIN
    DELETE p
    FROM Password p
    JOIN deleted d ON p.StudentID = d.StudentID
END
GO

-- 12. Student表修改触发器：防止修改有引用的学生ID
CREATE TRIGGER trg_Student_Update
ON Student
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(StudentID)
    BEGIN
        IF EXISTS (SELECT 1 FROM Password p JOIN deleted d ON p.StudentID = d.StudentID)
        BEGIN
            RAISERROR('无法修改该学生ID，已有密码记录关联！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE Student
            SET StudentID = i.StudentID,
                Name = i.Name,
                CardID = i.CardID
            FROM Student s
            JOIN inserted i ON s.StudentID = i.StudentID
        END
    END
    ELSE
    BEGIN
        UPDATE Student
        SET Name = i.Name,
            CardID = i.CardID
        FROM Student s
        JOIN inserted i ON s.StudentID = i.StudentID
    END
END
GO

-- 13. OrderDetail表删除触发器：级联删除OrderItem表中的记录
CREATE TRIGGER trg_OrderDetail_Delete
ON OrderDetail
AFTER DELETE
AS
BEGIN
    DELETE oi
    FROM OrderItem oi
    JOIN deleted d ON oi.OrderID = d.OrderID
END
GO

-- 14. OrderDetail表修改触发器：防止修改有引用的订单ID
CREATE TRIGGER trg_OrderDetail_Update
ON OrderDetail
INSTEAD OF UPDATE
AS
BEGIN
    IF UPDATE(OrderID)
    BEGIN
        IF EXISTS (SELECT 1 FROM OrderItem oi JOIN deleted d ON oi.OrderID = d.OrderID)
        BEGIN
            RAISERROR('无法修改该订单ID，已有订单项关联！', 16, 1)
            ROLLBACK TRANSACTION
        END
        ELSE
        BEGIN
            UPDATE OrderDetail
            SET OrderID = i.OrderID,
                OrderType = i.OrderType,
                OrderTime = i.OrderTime,
                TotalAmount = i.TotalAmount,
                CardID = i.CardID,
                WindowID = i.WindowID
            FROM OrderDetail od
            JOIN inserted i ON od.OrderID = i.OrderID
        END
    END
    ELSE
    BEGIN
        UPDATE OrderDetail
        SET OrderType = i.OrderType,
            OrderTime = i.OrderTime,
            TotalAmount = i.TotalAmount,
            CardID = i.CardID,
            WindowID = i.WindowID
        FROM OrderDetail od
        JOIN inserted i ON od.OrderID = i.OrderID
    END
END
GO
