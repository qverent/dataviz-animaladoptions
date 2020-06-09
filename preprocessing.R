library(tidyverse)

dat_in <- read_csv("data/Austin_Animal_Center_Intakes.csv") %>% 
  rename(id = "Animal ID",
         date_in = DateTime,
         type = "Animal Type",
         age_in = "Age upon Intake",
         intake_type = "Intake Type",
         intake_condition = "Intake Condition",
         sex_upon_intake = "Sex upon Intake") %>% 
  select(-MonthYear, -"Found Location") %>% 
  mutate(date_in = str_remove(date_in, " .*")) %>% 
  mutate(date_in = parse_date(date_in, "%m/%d/%Y")) %>%
  filter(date_in <= as.Date("2019-12-31")) %>% 
  group_by(id) %>% 
  filter(date_in == max(date_in))

dat_out <- read_csv("data/Austin_Animal_Center_Outcomes.csv") %>% 
  rename(id = "Animal ID",
         date_out = DateTime,
         birth = "Date of Birth",
         type = "Animal Type",
         age_out = "Age upon Outcome",
         outcome_type = "Outcome Type",
         outcome_subtype = "Outcome Subtype",
         sex_upon_outcome = "Sex upon Outcome") %>% 
  select(-MonthYear, -birth) %>% 
  mutate(date_out = str_remove(date_out, " .*")) %>% 
  mutate(date_out = parse_date(date_out, "%m/%d/%Y")) %>%
  filter(date_out <= as.Date("2019-12-31")) %>% 
  filter(!is.na(outcome_type)) %>% 
  group_by(id) %>% 
  filter(date_out == max(date_out))

dat <- left_join(dat_in, dat_out)

dat <-
  dat %>% 
  rename(name = Name,
         breed = Breed,
         color = Color)

dat_proc <- 
  dat %>% 
  mutate(outcome_type = case_when(
    outcome_type == "Adoption" ~ "Adopted",
    outcome_type == "Missing" ~ "Missing",
    str_detect(outcome_type, "(Died)|(Disposal)|(Euthanasia)") ~ "Deceased",
    str_detect(outcome_type, "(Relocate)|(Transfer)") ~ "Transferred",
    str_detect(outcome_type, "(Return to Owner)|(Rto-Adopt)") ~ "Returned to Owner",
    TRUE ~ "In Shelter"
  )) %>% 
  mutate(age_out = case_when(
    str_detect(age_out, "(day)|(week)|(month)|(0 years)") ~ "Baby",
    str_detect(age_out, "[1-2] (years?)") ~ "Young",
    str_detect(age_out, "[3-8] (years)") ~ "Adult",
    str_detect(age_out, "(9|1[0-9]|2[0-9]) (years)") ~ "Senior",
    age_out == "NULL" ~ "Unknown",
    is.na(age_out) ~ "N/A",
    TRUE ~ ""
  )) %>%
  mutate(name = case_when(
    str_detect(name, "\\*") ~ str_remove_all(name, "\\*"),
    is.na(name) | name == "" | name == " " ~ "N/A",
    TRUE ~ name
  )) %>% 
  mutate(breed = case_when(
    type == "Other" & str_detect(breed, "Bat") ~ "Bat",
    type == "Other" & str_detect(breed, "Prairie Dog") ~ "Prairie Dog",
    type == "Other" & str_detect(breed, "Squirrel") ~ "Squirrel",
    type == "Other" & str_detect(breed, "Sugar Glider") ~ "Sugar Glider",
    type == "Other" & str_detect(breed, "Frog") ~ "Frog",
    type == "Other" & str_detect(breed, "Guinea Pig") ~ "Guinea Pig",
    type == "Other" & str_detect(breed, "Ferret") ~ "Ferret",
    type == "Other" & str_detect(breed, "Snake") ~ "Snake",
    type == "Other" & str_detect(breed, "Mouse") ~ "Mouse",
    type == "Other" & str_detect(breed, "Lizard") ~ "Lizard",
    type == "Other" & str_detect(breed, "Chinchilla") ~ "Chinchilla",
    type == "Other" & str_detect(breed, "Hamster") ~ "Hamster",
    type == "Other" & str_detect(breed, "(Opossum)|(Ringtail)") ~ "Opossum",
    type == "Other" & str_detect(breed, "Cold Water") ~ "Fish",
    type == "Other" & str_detect(breed, "Tortoise") ~ "Tortoise",
    type == "Other" & str_detect(breed, "Rat") ~ "Rat",
    type == "Other" & str_detect(breed, "Turtle") ~ "Turtle",
    type == "Other" & str_detect(breed, "Hedgehog") ~ "Hedgehog",
    type == "Other" & str_detect(breed, "Gerbil") ~ "Gerbil",
    type == "Other" & str_detect(breed, "Tarantula") ~ "Tarantula",
    type == "Other" & str_detect(breed, "Fox") ~ "Fox",
    type == "Other" & str_detect(breed, "Crab") ~ "Crab",
    type == "Other" & str_detect(breed, "Raccoon") ~ "Raccoon",
    type == "Other" & str_detect(breed, "Armadillo") ~ "Armadillo",
    type == "Other" & str_detect(breed, "Bobcat") ~ "Bobcat",
    type == "Other" & str_detect(breed, "Coyote") ~ "Coyote",
    type == "Other" & str_detect(breed, "Deer") ~ "Deer",
    type == "Other" & str_detect(breed, "Otter") ~ "Otter",
    type == "Other" & str_detect(breed, "Skunk") ~ "Skunk",
    type == "Other" & str_detect(breed, "(Polish)|(Rabbit)|(Californian)|(Lionhead)|(Dutch)|(Angora-French Mix)|(Lop)|(Rex)") ~ "Rabbit",
    type == "Other" & str_detect(breed, "(Rhinelander Mix)|(Havana)|(New Zealand Wht)|(Netherlnd Dwarf)|(English Spot)|(Cinnamon)") ~ "Rabbit",
    type == "Other" & str_detect(breed, "(Angora)|(American)|(Hotot)|(Checkered Giant)|(Flemish Giant)|(Harlequin)|(Jersey Wooly)") ~ "Rabbit",
    type == "Other" & str_detect(breed, "(Silver)|(Cottontail)|(Britannia Petit)|(Polish)|(Beveren)|(Himalayan)|(Belgian Hare)") ~ "Rabbit",
    TRUE ~ breed
  )) %>% 
  mutate(color = str_remove(color, "/.*")) %>% 
  mutate(color = case_when(
    str_detect(color, "(Agouti)|(Black Tabby)|(Point)|(Tick)|(Merle)|(Blue Tabby)|(Blue Tiger)|(Brown Brindle)") ~ "Mixed",
    str_detect(color, "(Brown Tabby)|(Brown Tiger)|(Calico)|(Sable)|(Silver Tabby)|(Torbie)|(Tortie)|(Tricolor)|(Yellow Brindle)") ~ "Mixed",
    str_detect(color, "Black") ~ "Black",
    str_detect(color, "(Blue)|(Gray)|(Silver)") ~ "Gray",
    str_detect(color, "Green") ~ "Green",
    str_detect(color, "(Brown)|(Chocolate)|(Liver)") ~ "Brown",
    str_detect(color, "(Apricot)|(Buff)|(Cream)|(Fawn)|(Ruddy)|(Tan)") ~ "Cream",
    str_detect(color, "Orange") ~ "Orange",
    str_detect(color, "Pink") ~ "Pink",
    str_detect(color, "Red") ~ "Red",
    str_detect(color, "White") ~ "White",
    str_detect(color, "(Gold)|(Yellow)") ~ "Yellow",
    TRUE ~ color
  ))

dat_proc <- 
  dat_proc %>% 
  mutate(type = case_when(
    type == "Bird" ~ "Other",
    type == "Livestock" ~ "Other",
    TRUE ~ type
  ))

dat_final <- 
  dat_proc %>% 
  select(id, date_in, date_out, name, type, breed, color, age_out, outcome_type, everything())

write_csv(dat_final, "data/animals.csv")



adoptions <- 
  dat_final %>% 
  filter(outcome_type == "Adopted") %>% 
  group_by(date_out, type) %>% 
  tally() %>% 
  rename(date = date_out, adoptions = n) %>% 
  arrange(date)

write_csv(adoptions, "data/adoptions.csv")


dat_ungroup <- 
  dat_final %>% 
  ungroup()

sample <- sample_n(dat_ungroup, 2000)

write_csv(sample, "data/sample.csv")
