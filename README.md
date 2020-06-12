# dataviz-animaladoptions
A d3.js project visualizing data from the Austin Animal Center. This was the capstone group project for a Spring, 2020 data visualization class. Checkout the demo at [https://qverent.github.io/dataviz-animaladoptions/](https://qverent.github.io/dataviz-animaladoptions/).

## Team
Polly Tang, Michael Zhang, [@qverent](https://github.com/qverent)

## Context & Task Abstraction
This project features data from the Austin Animal Centre, which intakes 20,000 animals annually and whose work is a leading factor behind Austin, Texas’ status as the [“largest no-kill community”](http://www.austintexas.gov/page/no-kill-plan) in the US. Since 2011, the Centre has been able to maintain an extremely high survival outcome; its current save rate is [97%](https://www.austinpetsalive.org/about/our-story).

This colour deficiency-safe tool was created with the shelter’s managers and communications team in mind. Using three distinct interactive visualizations and a statistics panel, the app presents data on animal outcomes collected
from October 2013 to December 2019. The original dataset is available at [Data World](https://data.world/rebeccaclay/austin-tx-animal-center-stats).

Users can identify trends in historical data, such as fluctuation of adoption rates by time of year or animal
type, as well as comparison of animal demographics in terms of age and colour. This gives the users the
opportunity to gain a better understanding of adoption preferences and focus on efforts to boost the chance
of survival for historically overlooked animals due to characteristics such as age or colour.

## Reflection
We feel that one design spec we should have clarified at the beginning of the project is the target screen size.
This was only considered midway. The original design was sketched from the perspective of our
laptops, but in reality, many (shelter) office desktops have larger screens. If we were to confirm this, we would be able to better leverage the full data set and create a more powerful dashboard:
* The current charts would serve as overviews and we would include additional panels for the user to explore the dataset in greater detail
* We would have enough space to render the full dataset in chart 2
* We would not aggregate our data (e.g. colours; wildlife/small animals were all aggregated to "other") so aggressively and would include information such as breed: granularity would be useful for more specific strategies for improving survival outcomes

Since the dataset contains tremendous potential as a public engagement tool to inform the public about
overlooked animals, we would also consider a public-facing version. We would achieve this by including data
of animals available for adoption and adapt chart 2 so that animals are sorted by their length of residency. In
other words, users would be able to browse adoptees by length of stay and, thanks to linked highlighting with
Chart 3, gain a larger picture view about the animal’s adoptability, thus creating an emotional impact.
This would be an alternative to standard adoption tools which are designed for browsing available animals by
age and colour. This model does not challenge preconceived notions of animal age/colouring and can be a
factor behind skewed adoption rates in shelters.
