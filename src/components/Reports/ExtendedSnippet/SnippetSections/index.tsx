
import MarketOverviewCard from  "./MarketOverviewCard";

export interface MarketSizeProps {
  heading?: string;
  image?: { url: string; alt_text?: string }[];
  finalData?: { label: string; value: string | number }[];
  key_factors?: {
    heading: string;
    type: string; // "text" | "images"
    value: string | number | { url: string; alt_text?: string }[] | null;
  }[];
  left_nav_heading?: string;
  order?: number;
  unique_key?: string;
}
interface MarketSizeData {
  data: MarketSizeProps;
}
const MarketSize: React.FC<MarketSizeData> = ({ data }) => {

    const h2Styles = {
      fontSize: '20px',
      lineHeight: '30px',
      color: '#195571',
      fontFamily: "sans-serif",
      fontWeight: 800,
      marginBottom: '10px',
      marginTop: '1rem'
    };
  return (
    <section >
     
      <h2 style={h2Styles}
      className={`md:flex-1 w-full text-Display-Semibold-20` }>
      {data?.heading}
    </h2>
     

      <MarketOverviewCard
        data={data}
      />

      
    </section>
  );
}

export default MarketSize;
