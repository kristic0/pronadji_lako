# Pronadji Lako

This is a project that my colleagues and I have been working on, the point of this repository is to showcase my skills and to highlight couple of specific problems that I've solved.

**This is not the whole project, i had to delete a lot of the code in order to make the repository public**

I have decided to use **Nest.js**, **MySQL**, **Docker** and **Gitlab CI/CD** because I was already familiar with these technologies.
Now that the project has evolved, I think a better choise would have been to use Postgress instead of MySQL, because of how I'm thinking of saving closest nanny results, but I don't think we will be changing to it because the time it would take to move this to use Postgress would outweigh the benefits.

## Challenges I have faced:

#### 1. Nominatim, because i wanted the docker image to be as small as possible

The steps i took:

1. Download the osm Serbia file from Geofabrik
2. Generate OSM Boundaries of the cities that we decided to support (only top 15 cities in Serbia by population)
3. With the boundaries disected the osm file, first i tried with osmosis but it was very slow then i learned of osmium and successufully created a 1GB nominatim docker image

#### 2. Finding nannies that are the closest to the user

I have spent a lot of time trying to find a formula that would do what i was trying to achieve, which was the Haversine formula. <br /> My idea was to get the coordinates of the user ,upon the users registration we would ask the user to provide their city and address and with nominatim i could get the real coordinates of the users house. If the user doesn't provide the real address I would just get the middle coordinates of the city and use them to locate the closes nannies.
If the user does provide the address, I can use the Haversine formula and run it against all nannies in their city, the calculation is happening in the database and it looks like this:

```sql
SELECT
      user_id,
      name,
      lastname,
      profile_image,
      address,
      c.naselje_ime_lat,
      pricePerHour,
      isNanny,
      (6371  * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(lat)) *
          COS(RADIANS(\`long\`) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(lat))
      )) AS distance
      FROM
          user
      JOIN city c ON user.cityCityId = c.naselje_maticni_broj
      WHERE user.isNanny = true
      ORDER BY
          distance ASC;
```

These are just some things i found challenging and interesting to work on.
