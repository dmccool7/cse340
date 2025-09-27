-- Assignment 2

-- #1
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- #2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- #3
DELETE FROM public.account
WHERE account_id = 1;

-- #4
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a large interior')
WHERE inv_id = 10;

-- #5
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
	JOIN public.classification c
	ON c.classification_id = i.classification_id
WHERE i.classification_id = 2;

-- #6
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, 'images', 'images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, 'images', 'images/vehicles');