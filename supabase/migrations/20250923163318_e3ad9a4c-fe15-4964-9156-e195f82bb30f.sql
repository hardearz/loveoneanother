-- First, add some categories
INSERT INTO public.categories (name) VALUES
('Community Cleanup'),
('Elderly Care'),
('Environmental'),
('Food & Hunger'),
('Education'),
('Animal Care'),
('Healthcare'),
('Youth Programs'),
('Arts & Culture'),
('Technology Help');

-- Now add 20 sample tasks across various categories
-- We'll need to get the category IDs first, so let's insert tasks with references to categories

WITH category_ids AS (
  SELECT id, name FROM public.categories
)

INSERT INTO public.tasks (
  title, 
  description, 
  location_address, 
  reward_luvs, 
  deadline, 
  status, 
  category_id
) VALUES
-- Community Cleanup tasks
(
  'Neighborhood Park Cleanup',
  'Help clean up trash and debris from Riverside Park. Bring gloves and wear comfortable clothes. We will provide trash bags and tools.',
  '1234 Riverside Park Dr, Springfield, IL',
  25,
  '2025-10-15 17:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Community Cleanup')
),
(
  'Street Litter Collection',
  'Walk designated downtown streets and collect litter. Route map will be provided. Great for individuals or small groups.',
  '456 Main Street, Springfield, IL', 
  20,
  '2025-10-20 16:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Community Cleanup')
),

-- Elderly Care tasks  
(
  'Grocery Shopping for Seniors',
  'Shop for groceries and household items for elderly residents who have mobility challenges. List will be provided.',
  '789 Oak Senior Center, Springfield, IL',
  30,
  '2025-10-18 14:00:00', 
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Elderly Care')
),
(
  'Technology Help for Seniors',
  'Assist elderly residents with smartphones, tablets, and computer basics. Patient and friendly volunteers needed.',
  '321 Elm Community Center, Springfield, IL',
  35,
  '2025-10-25 15:00:00',
  'Available', 
  (SELECT id FROM category_ids WHERE name = 'Elderly Care')
),

-- Environmental tasks
(
  'Tree Planting Initiative', 
  'Plant native trees in designated areas around the city. Physical work required. Tools and saplings provided.',
  '567 Forest Ave, Springfield, IL',
  40,
  '2025-10-22 11:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Environmental')
),
(
  'River Cleanup Project',
  'Remove trash and debris from riverbank areas. Waders and gloves provided. Some physical activity required.',
  '890 River Road, Springfield, IL', 
  45,
  '2025-11-01 10:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Environmental')
),

-- Food & Hunger tasks
(
  'Food Bank Sorting',
  'Sort and organize donated food items at the local food bank. Indoor work, perfect for any weather.',
  '234 Charity Lane, Springfield, IL',
  20,
  '2025-10-16 13:00:00',
  'Available', 
  (SELECT id FROM category_ids WHERE name = 'Food & Hunger')
),
(
  'Soup Kitchen Service',
  'Help serve meals to those in need. Food service experience helpful but not required. Hairnet provided.',
  '678 Hope Street, Springfield, IL',
  30,
  '2025-10-19 12:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Food & Hunger')
),

-- Education tasks
(
  'Reading Tutor for Kids',
  'Help elementary students with reading skills. Background check required. Training session provided.',
  '345 Elementary School Way, Springfield, IL', 
  35,
  '2025-10-30 15:30:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Education')
),
(
  'Library Book Organization', 
  'Help reorganize and shelve books at the public library. Detail-oriented volunteers needed.',
  '123 Library Circle, Springfield, IL',
  25,
  '2025-10-28 14:00:00', 
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Education')
),

-- Animal Care tasks
(
  'Dog Walking at Shelter',
  'Walk dogs at the animal shelter to help with their exercise and socialization. Must be comfortable with dogs.',
  '456 Animal Shelter Rd, Springfield, IL',
  25,
  '2025-10-17 16:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Animal Care')
),
(
  'Cat Socialization Help',
  'Spend time with cats at the shelter to help them become more social and adoptable. Cat experience preferred.',
  '456 Animal Shelter Rd, Springfield, IL',
  20,
  '2025-10-24 15:00:00',
  'Available', 
  (SELECT id FROM category_ids WHERE name = 'Animal Care')
),

-- Healthcare tasks
(
  'Health Fair Volunteer',
  'Assist with registration and information distribution at community health fair. Customer service skills helpful.',
  '789 Convention Center Dr, Springfield, IL',
  30,
  '2025-11-05 09:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Healthcare')
),
(
  'Medical Supply Organization',
  'Help organize and inventory medical supplies at local clinic. Attention to detail required.',
  '234 Clinic Avenue, Springfield, IL',
  25,
  '2025-10-26 10:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Healthcare')
),

-- Youth Programs tasks
(
  'Youth Basketball Coaching',
  'Assistant coach for youth basketball team. Sports experience preferred but enthusiasm is most important.',
  '567 Community Gym, Springfield, IL',
  40,
  '2025-11-02 17:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Youth Programs')
),
(
  'After School Homework Help',
  'Help middle school students with homework and study skills. Math and science help especially needed.',
  '890 Middle School Lane, Springfield, IL', 
  35,
  '2025-10-27 16:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Youth Programs')
),

-- Arts & Culture tasks
(
  'Art Class Assistant',
  'Help with community art classes for all ages. Set up supplies and assist participants. Art experience helpful.',
  '123 Arts Center Blvd, Springfield, IL',
  30,
  '2025-11-03 14:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Arts & Culture')
),
(
  'Cultural Festival Setup',
  'Help set up booths and decorations for annual cultural festival. Physical setup work required.',
  '456 Festival Grounds, Springfield, IL',
  35,
  '2025-11-08 08:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Arts & Culture')
),

-- Technology Help tasks
(
  'Computer Lab Maintenance',
  'Help maintain computers at community center lab. Basic tech skills required. Training provided.',
  '789 Tech Center Way, Springfield, IL',
  40,
  '2025-10-29 13:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Technology Help')
),
(
  'Digital Literacy Classes',
  'Teach basic computer and internet skills to community members. Patient teaching style required.',
  '321 Learning Center Dr, Springfield, IL',
  45,
  '2025-11-04 18:00:00',
  'Available',
  (SELECT id FROM category_ids WHERE name = 'Technology Help')
);