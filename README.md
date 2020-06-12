# dataviz-animaladoptions
A d3.js project visualizing data from the Austin Animal Center. This was the capstone group project for a Spring, 2020 data visualization class. A demo is [available](https://qverent.github.io/dataviz-animaladoptions/).


## Team
Polly Tang, Michael Zhang, [@qverent](https://github.com/qverent)


## Context & Task Abstraction
This project features data from the Austin Animal Centre, which intakes 20,000 animals annually and whose work is a leading factor behind Austin, Texas’ status as the [“largest no-kill community”](http://www.austintexas.gov/page/no-kill-plan) in the US. Since 2011, the Centre has been able to maintain an extremely high survival outcome; its current save rate is [97%](https://www.austinpetsalive.org/about/our-story).

This colour deficiency-safe tool was created with the shelter’s managers and communications team in mind. Using three distinct interactive visualizations and a statistics panel, the app presents data on animal outcomes collected
from October 2013 to December 2019. The original dataset is available at [Data World](https://data.world/rebeccaclay/austin-tx-animal-center-stats).

Users can identify trends in historical data, such as fluctuation of adoption rates by time of year or animal type, as well as comparison of animal demographics in terms of age and colour. This gives the users the opportunity to gain a better understanding of adoption preferences and focus on efforts to boost the chance of survival for historically overlooked animals due to characteristics such as age or colour.


## Data preprocessing
Data preprocessing was done via an R script and some additional Javascript. The preprocessing step included binning the animal types to ‘dog’, ‘cat’ and ‘other’, binning the primary colour type of each animal (see R script for the binning specifics from 585 values to 11), handling missing data and ambiguous categories, and converting age strings (for example -- 4 weeks, or 3 months) into categories (for example -- young or senior).

This preprocessing step meaningfully groups outcomes, ages, and colours into broader categories that can be communicated more expressively in our visualizations. For example, animals recorded as chocolate or liver in colour would be re-recorded as brown to reduce clutter without detracting meaning from our visualization.


## Chart 1: Adoption rates line graph
We chose to use a line chart as we are representing temporal and continuous data. We used colour hue to differentiate the categorical attribute of animal type as it is one of the most effective channels for categorical data due to ease of perception and no learning curve. The brush is locked to one-month increments. This was done to facilitate the filtering of data in other charts; as well, it minimizes the number of x-axis ticks to every six months. This is important due to limited horizontal space.


## Chart 2: Faceted small multiples chart showing individual animals in care of the Centre a selected timeframe
This chart shows how the outcome (four categories: adopted, returned to owner, transferred, deceased) for animals varies based on its type (identify trends), and represents each animal as a mark in the chart to visually present the number of lives passing through this centre. By hovering on an individual dot, a tooltip appears to provide details specific to the individual animal.

The legend serves as a filtering widget: by clicking legend label, the corresponding outcome is filtered out. This is extremely useful if the user wishes to make comparisons such as specific outcomes and animal types, or if they wish to analyze trends within one specific outcome type.

Note that this chart contains a subset of the entire dataset, which contained information on over 110,000 animals. This was done to address computational and space limitations. Since the subset reflects the distribution of the overall dataset, the user is still able to achieve the intended tasks of comparing outcomes.
We chose to encode the data with point marks, using hue to differentiate between outcome categories. This is because colour is one of the most effective channels for encoding categorical data. Since hue was used to encode categorical data in charts 1 and 2, replicating this channel provides a sense of continuity throughout the app. Animal type is encoded in the y-axis and outcome date is encoded in the x-axis. Some y-positioning jitter is introduced to minimize overlapping of dots.


## Chart 3: Histograms of animal age and colour groups
Chart 3 implements linked highlighting with chart 2 so that users can see how each individual animal fits into the distribution of age and colour (present distribution, identify trends) of animals at the shelter. Data timeframe is controlled by the brush in chart 1 and users can see what attributes are more common in general, or during a certain timeframe (ie. more baby animals during breeding seasons). The counts for each animal are encoded in a histogram format as it is the simplest to visually present and compare trends across groups, and data from the large number of animals can be aggregated into a single view. This chart utilizes the same colour hue encoding as chart 1 so that there is a unified representation for animal types across the entire visualization.


## Reflection
We feel that one design spec we should have clarified at the beginning of the project is the target screen size.
This was only considered midway. The original design was sketched from the perspective of our
laptops, but in reality, many (shelter) office desktops have larger screens. If we were to confirm this, we would be able to better leverage the full data set and create a more powerful dashboard:
* The current charts would serve as overviews and we would include additional panels for the user to explore the dataset in greater detail
* We would have enough space to render the full dataset in chart 2
* We would not aggregate our data (e.g. colours; wildlife/small animals were all aggregated to "other") so aggressively and would include information such as breed: granularity would be useful for more specific strategies for improving survival outcomes

The dataset has trememdous potential as a public engagement tool to inform potential adopters about overlooked animals. Animal listings could be (initially) sorted by length of stay and the animals' age, breed and colour. Such characteristics could be linked to the above charts so that the potential adopter would access a "big picture view" about how these characteristics can affect the animals' adoptability. This would be an alternative to standard adoption tools which are designed for browsing available animals by age, colour and breed.
